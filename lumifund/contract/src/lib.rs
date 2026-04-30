#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, token, vec,
    Address, Env, Map, String, Symbol, Vec,
};

// ── Storage keys ──────────────────────────────────────────────────────────────

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Campaign(u64),
    Contribution(u64),
    CampaignCount,
    ContribCount,
}

// ── Domain types ──────────────────────────────────────────────────────────────

#[contracttype]
#[derive(Clone, PartialEq)]
pub enum CampaignStatus {
    Active,
    Successful,
    Failed,
}

#[contracttype]
#[derive(Clone)]
pub struct Milestone {
    pub description: String,
    pub target_pct: u32,   // % of goal that unlocks this milestone (1-100)
    pub votes_for: u32,
    pub votes_against: u32,
    pub released: bool,
}

#[contracttype]
#[derive(Clone)]
pub struct Campaign {
    pub id: u64,
    pub creator: Address,
    pub goal: i128,
    pub token: Address,
    pub raised: i128,
    pub status: CampaignStatus,
    pub milestones: Vec<Milestone>,
    pub voters: Map<u32, Vec<Address>>, // milestone_index → voters
}

#[contracttype]
#[derive(Clone)]
pub struct Contribution {
    pub id: u64,
    pub campaign_id: u64,
    pub contributor: Address,
    pub amount: i128,
    pub refunded: bool,
}

// ── Contract ──────────────────────────────────────────────────────────────────

#[contract]
pub struct LumiFund;

#[contractimpl]
impl LumiFund {
    // ── create_campaign ───────────────────────────────────────────────────────

    pub fn create_campaign(
        env: Env,
        creator: Address,
        goal: i128,
        token: Address,
        milestones: Vec<Milestone>,
    ) -> u64 {
        creator.require_auth();
        assert!(goal > 0, "goal must be positive");
        assert!(!milestones.is_empty(), "need at least one milestone");

        let id = Self::next_campaign_id(&env);
        let campaign = Campaign {
            id,
            creator: creator.clone(),
            goal,
            token,
            raised: 0,
            status: CampaignStatus::Active,
            milestones,
            voters: Map::new(&env),
        };
        env.storage().persistent().set(&DataKey::Campaign(id), &campaign);

        env.events().publish(
            (Symbol::new(&env, "campaign_created"),),
            (id, creator, goal),
        );
        id
    }

    // ── contribute ────────────────────────────────────────────────────────────

    pub fn contribute(
        env: Env,
        campaign_id: u64,
        contributor: Address,
        amount: i128,
    ) -> u64 {
        contributor.require_auth();
        assert!(amount > 0, "amount must be positive");

        let mut campaign: Campaign = env
            .storage()
            .persistent()
            .get(&DataKey::Campaign(campaign_id))
            .expect("campaign not found");
        assert!(campaign.status == CampaignStatus::Active, "campaign not active");

        // Transfer tokens from contributor to contract
        token::Client::new(&env, &campaign.token).transfer(
            &contributor,
            &env.current_contract_address(),
            &amount,
        );

        campaign.raised += amount;
        env.storage().persistent().set(&DataKey::Campaign(campaign_id), &campaign);

        let cid = Self::next_contrib_id(&env);
        let contribution = Contribution {
            id: cid,
            campaign_id,
            contributor: contributor.clone(),
            amount,
            refunded: false,
        };
        env.storage().persistent().set(&DataKey::Contribution(cid), &contribution);

        env.events().publish(
            (Symbol::new(&env, "contributed"),),
            (campaign_id, cid, contributor, amount),
        );
        cid
    }

    // ── vote_milestone ────────────────────────────────────────────────────────

    pub fn vote_milestone(
        env: Env,
        campaign_id: u64,
        milestone_index: u32,
        voter: Address,
        approve: bool,
    ) {
        voter.require_auth();

        let mut campaign: Campaign = env
            .storage()
            .persistent()
            .get(&DataKey::Campaign(campaign_id))
            .expect("campaign not found");
        assert!(campaign.status == CampaignStatus::Active, "campaign not active");
        assert!(
            (milestone_index as u32) < campaign.milestones.len(),
            "invalid milestone"
        );

        // Ensure voter hasn't already voted on this milestone
        let mut voted: Vec<Address> = campaign
            .voters
            .get(milestone_index)
            .unwrap_or_else(|| Vec::new(&env));
        assert!(!voted.contains(&voter), "already voted");
        voted.push_back(voter.clone());
        campaign.voters.set(milestone_index, voted);

        let mut ms = campaign.milestones.get(milestone_index).unwrap();
        if approve {
            ms.votes_for += 1;
        } else {
            ms.votes_against += 1;
        }
        campaign.milestones.set(milestone_index, ms.clone());
        env.storage().persistent().set(&DataKey::Campaign(campaign_id), &campaign);

        env.events().publish(
            (Symbol::new(&env, "milestone_voted"),),
            (campaign_id, milestone_index, voter, approve, ms.votes_for, ms.votes_against),
        );
    }

    // ── release_funds ─────────────────────────────────────────────────────────

    pub fn release_funds(env: Env, campaign_id: u64, milestone_index: u32) {
        let mut campaign: Campaign = env
            .storage()
            .persistent()
            .get(&DataKey::Campaign(campaign_id))
            .expect("campaign not found");

        campaign.creator.require_auth();
        assert!(campaign.status == CampaignStatus::Active, "campaign not active");
        assert!(
            (milestone_index as u32) < campaign.milestones.len(),
            "invalid milestone"
        );

        let ms = campaign.milestones.get(milestone_index).unwrap();
        assert!(!ms.released, "already released");
        assert!(ms.votes_for > ms.votes_against, "milestone not approved by backers");

        // Amount = milestone target_pct % of goal
        let release_amount = campaign.goal * ms.target_pct as i128 / 100;
        assert!(campaign.raised >= release_amount, "insufficient funds raised");

        token::Client::new(&env, &campaign.token).transfer(
            &env.current_contract_address(),
            &campaign.creator,
            &release_amount,
        );

        let mut ms_mut = ms;
        ms_mut.released = true;
        campaign.milestones.set(milestone_index, ms_mut);

        // Mark successful if last milestone
        let all_released = (0..campaign.milestones.len())
            .all(|i| campaign.milestones.get(i as u32).unwrap().released);
        if all_released {
            campaign.status = CampaignStatus::Successful;
        }

        env.storage().persistent().set(&DataKey::Campaign(campaign_id), &campaign);

        env.events().publish(
            (Symbol::new(&env, "funds_released"),),
            (campaign_id, milestone_index, release_amount),
        );
    }

    // ── refund ────────────────────────────────────────────────────────────────

    pub fn refund(env: Env, campaign_id: u64, contribution_id: u64) {
        let campaign: Campaign = env
            .storage()
            .persistent()
            .get(&DataKey::Campaign(campaign_id))
            .expect("campaign not found");
        assert!(campaign.status == CampaignStatus::Failed, "campaign not failed");

        let mut contribution: Contribution = env
            .storage()
            .persistent()
            .get(&DataKey::Contribution(contribution_id))
            .expect("contribution not found");
        assert!(contribution.campaign_id == campaign_id, "wrong campaign");
        assert!(!contribution.refunded, "already refunded");

        contribution.contributor.require_auth();
        contribution.refunded = true;

        token::Client::new(&env, &campaign.token).transfer(
            &env.current_contract_address(),
            &contribution.contributor,
            &contribution.amount,
        );

        env.storage()
            .persistent()
            .set(&DataKey::Contribution(contribution_id), &contribution);

        env.events().publish(
            (Symbol::new(&env, "refunded"),),
            (campaign_id, contribution_id, contribution.contributor, contribution.amount),
        );
    }

    // ── fail_campaign (admin / deadline enforcement) ──────────────────────────

    pub fn fail_campaign(env: Env, campaign_id: u64, admin: Address) {
        admin.require_auth();
        let mut campaign: Campaign = env
            .storage()
            .persistent()
            .get(&DataKey::Campaign(campaign_id))
            .expect("campaign not found");
        assert!(campaign.status == CampaignStatus::Active, "not active");
        campaign.status = CampaignStatus::Failed;
        env.storage().persistent().set(&DataKey::Campaign(campaign_id), &campaign);

        env.events().publish(
            (Symbol::new(&env, "campaign_failed"),),
            (campaign_id,),
        );
    }

    // ── views ─────────────────────────────────────────────────────────────────

    pub fn get_campaign(env: Env, campaign_id: u64) -> Campaign {
        env.storage()
            .persistent()
            .get(&DataKey::Campaign(campaign_id))
            .expect("campaign not found")
    }

    pub fn get_contribution(env: Env, contribution_id: u64) -> Contribution {
        env.storage()
            .persistent()
            .get(&DataKey::Contribution(contribution_id))
            .expect("contribution not found")
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    fn next_campaign_id(env: &Env) -> u64 {
        let id: u64 = env
            .storage()
            .persistent()
            .get(&DataKey::CampaignCount)
            .unwrap_or(0)
            + 1;
        env.storage().persistent().set(&DataKey::CampaignCount, &id);
        id
    }

    fn next_contrib_id(env: &Env) -> u64 {
        let id: u64 = env
            .storage()
            .persistent()
            .get(&DataKey::ContribCount)
            .unwrap_or(0)
            + 1;
        env.storage().persistent().set(&DataKey::ContribCount, &id);
        id
    }
}
