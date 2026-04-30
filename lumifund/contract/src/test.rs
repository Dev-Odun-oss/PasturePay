#![cfg(test)]
use super::*;
use soroban_sdk::{
    testutils::{Address as _, AuthorizedFunction, AuthorizedInvocation},
    token::{Client as TokenClient, StellarAssetClient},
    vec, Address, Env, String,
};

fn setup() -> (Env, Address, Address, Address) {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, LumiFund);
    let token_admin = Address::generate(&env);
    let token_id = env.register_stellar_asset_contract(token_admin.clone());

    (env, contract_id, token_id, token_admin)
}

fn mint(env: &Env, token_id: &Address, token_admin: &Address, to: &Address, amount: i128) {
    StellarAssetClient::new(env, token_id).mint(to, &amount);
}

fn make_milestones(env: &Env) -> Vec<Milestone> {
    vec![
        env,
        Milestone {
            description: String::from_str(env, "Prototype"),
            target_pct: 50,
            votes_for: 0,
            votes_against: 0,
            released: false,
        },
        Milestone {
            description: String::from_str(env, "Launch"),
            target_pct: 50,
            votes_for: 0,
            votes_against: 0,
            released: false,
        },
    ]
}

#[test]
fn test_create_campaign() {
    let (env, contract_id, token_id, _) = setup();
    let client = LumiFundClient::new(&env, &contract_id);
    let creator = Address::generate(&env);

    let id = client.create_campaign(
        &creator,
        &1000_i128,
        &token_id,
        &make_milestones(&env),
    );
    assert_eq!(id, 1);

    let campaign = client.get_campaign(&id);
    assert_eq!(campaign.goal, 1000);
    assert_eq!(campaign.raised, 0);
    assert_eq!(campaign.status, CampaignStatus::Active);
}

#[test]
fn test_contribute() {
    let (env, contract_id, token_id, token_admin) = setup();
    let client = LumiFundClient::new(&env, &contract_id);
    let creator = Address::generate(&env);
    let backer = Address::generate(&env);

    mint(&env, &token_id, &token_admin, &backer, 500);

    let cid = client.create_campaign(&creator, &1000, &token_id, &make_milestones(&env));
    let contrib_id = client.contribute(&cid, &backer, &300);

    let campaign = client.get_campaign(&cid);
    assert_eq!(campaign.raised, 300);

    let contrib = client.get_contribution(&contrib_id);
    assert_eq!(contrib.amount, 300);
    assert!(!contrib.refunded);
}

#[test]
fn test_vote_and_release() {
    let (env, contract_id, token_id, token_admin) = setup();
    let client = LumiFundClient::new(&env, &contract_id);
    let creator = Address::generate(&env);
    let backer1 = Address::generate(&env);
    let backer2 = Address::generate(&env);

    mint(&env, &token_id, &token_admin, &backer1, 600);
    mint(&env, &token_id, &token_admin, &backer2, 600);

    let cid = client.create_campaign(&creator, &1000, &token_id, &make_milestones(&env));
    client.contribute(&cid, &backer1, &600);
    client.contribute(&cid, &backer2, &400);

    // Vote approve on milestone 0
    client.vote_milestone(&cid, &0, &backer1, &true);
    client.vote_milestone(&cid, &0, &backer2, &true);

    // Release milestone 0 (50% of 1000 = 500)
    let creator_balance_before = TokenClient::new(&env, &token_id).balance(&creator);
    client.release_funds(&cid, &0);
    let creator_balance_after = TokenClient::new(&env, &token_id).balance(&creator);
    assert_eq!(creator_balance_after - creator_balance_before, 500);
}

#[test]
fn test_refund_on_failed_campaign() {
    let (env, contract_id, token_id, token_admin) = setup();
    let client = LumiFundClient::new(&env, &contract_id);
    let creator = Address::generate(&env);
    let backer = Address::generate(&env);
    let admin = Address::generate(&env);

    mint(&env, &token_id, &token_admin, &backer, 300);

    let cid = client.create_campaign(&creator, &1000, &token_id, &make_milestones(&env));
    let contrib_id = client.contribute(&cid, &backer, &300);

    client.fail_campaign(&cid, &admin);

    let balance_before = TokenClient::new(&env, &token_id).balance(&backer);
    client.refund(&cid, &contrib_id);
    let balance_after = TokenClient::new(&env, &token_id).balance(&backer);
    assert_eq!(balance_after - balance_before, 300);
}

#[test]
#[should_panic(expected = "already voted")]
fn test_double_vote_panics() {
    let (env, contract_id, token_id, token_admin) = setup();
    let client = LumiFundClient::new(&env, &contract_id);
    let creator = Address::generate(&env);
    let backer = Address::generate(&env);

    mint(&env, &token_id, &token_admin, &backer, 500);
    let cid = client.create_campaign(&creator, &1000, &token_id, &make_milestones(&env));
    client.contribute(&cid, &backer, &500);
    client.vote_milestone(&cid, &0, &backer, &true);
    client.vote_milestone(&cid, &0, &backer, &true); // should panic
}

#[test]
#[should_panic(expected = "already refunded")]
fn test_double_refund_panics() {
    let (env, contract_id, token_id, token_admin) = setup();
    let client = LumiFundClient::new(&env, &contract_id);
    let creator = Address::generate(&env);
    let backer = Address::generate(&env);
    let admin = Address::generate(&env);

    mint(&env, &token_id, &token_admin, &backer, 200);
    let cid = client.create_campaign(&creator, &1000, &token_id, &make_milestones(&env));
    let contrib_id = client.contribute(&cid, &backer, &200);
    client.fail_campaign(&cid, &admin);
    client.refund(&cid, &contrib_id);
    client.refund(&cid, &contrib_id); // should panic
}
