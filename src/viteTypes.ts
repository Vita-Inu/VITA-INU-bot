import { Hex, Uint8, Uint16, Int64, Uint64, TokenId, TokenInfo, Base64, 
    BlockType, RPCResponse } from '@vite/vitejs/distSrc/utils/type';
import { Address, BigInt, AccountBlockBlock, AddressObj } from '@vite/vitejs/distSrc/accountBlock/type';

export interface SBPInfo {
	name: String;						// Name of SBP
	blockProducingAddress: Address;		// Block creation address
	stakeAddress: Address;				// Registration address
	stakeAmount: BigInt;				// Amount staked
	expirationHeight: Uint64;			// Target unlocking height. Can be cancelled after locking period expires.
	expirationTime: Int64;				// Estimated target unlocking time
	revokeTime: Int64;					// Time of cancellation, or 0 for non-cancelled SBP node
}

export interface NodeInfo {
	id : String;				// Node ID
	name : String;				// Node name
	netId: BigInt;				// ID of Vite network connected
	peerCount: BigInt;			// Number of peers connected
	peers : PeerInfo[];			// Info about peers
}

export interface PeerInfo {
	name : String;
	height : Int64;				// Snapshot chain height
	address : String;			// Peer's IP address
	createAt: String;			// Time when this peer was connected
}

export interface RewardInfo {
	totalReward: BigInt;					// The total rewards that have not been retrieved
	blockProducingReward: BigInt;			// Un-retrieved block creation rewards
	votingReward: BigInt;					// Un-retrieved candidate additional rewards(voting rewards)
	producedBlocks: BigInt;
	targetBlocks: BigInt;
}

export interface RewardPendingInfo {
	totalReward: BigInt;					// The total rewards that have not been retrieved
	blockProducingReward: BigInt;			// Un-retrieved block creation rewards
	votingReward: BigInt;					// Un-retrieved candidate additional rewards(voting rewards)
    allRewardWithdrawed: boolean;			// If true, the SBP node has been cancelled and all rewards have been withdrawn
}

export interface RewardByDayInfo {
	rewardMap: ReadonlyMap<string, RewardInfo>;
	startTime: Int64;
	endTime: Int64;
	cycle: Uint64;
}

export interface StakeListInfo {
	totalStakeAmount : BigInt;				// Total staking amount of account
	totalStakeCount: Int64;					// Total number of staking records
	stakeList: Array<StakeInfo>;			// Stake info list
}

export interface StakeInfo {
	stakeAddress : Address;					// Address of staking account
	stakeAmount : BigInt;					// Amount staked
	expirationHeight : Uint64;				// Target unlocking height
	beneficiary : Address;					// Address of staking beneficiary
	expirationTime : Int64;					// Estimated target unlocking time
	isDelegated : boolean;					// Is a delegated staking record?
	delegatedAddress : Address;				// Adddress of delegate account, or 0 if non-delegated
	bid : Uint8;							// Business ID, or 0 if non-delegated
}

export interface Receiver {
	address: Address;
	amount: BigInt;
}

export interface SBPVoteDetail {
	blockProducerName: string;
	totalVotes: BigInt;
	blockProducingAddress: Address;
	historyProducingAddresses: ReadonlyArray<Address>;
	addressVoteMap: AddressVoteMap;
}

export interface AccountInfo {
	name: string;
	address: Address;
	blockCount: Uint64;
	balanceInfoMap: ReadonlyMap<string, BalanceInfo>;
}

export interface BalanceInfo {
	tokenInfo: TokenInfo;
	balance: BigInt;
	transactionCount: Uint64;
}

export interface QuotaInfo {
	currentQuota: Uint64;
	maxQuota: Uint64;
	stakeAmount: BigInt;
}

export interface ContractInfo {
	code: string;
	GID: string;
	responseLatency: Uint8;
	randomDegree: Uint8;
	quotaMultiplier: Uint8;
}

export interface SBPVoteInfo {
	sbpName: string;
	blockProducingAddress: Address,
	votes: BigInt
}

export interface AddressVoteMap {
	[key: string]: string;
}