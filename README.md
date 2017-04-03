## A note from LithMage

All of my mods are under MIT license unless noted otherwise.
I will not support if mods are downloaded from other sources than the ones i posted (Google drive link by me or from this git repo).
Please dont be shy to register an issue if it comes up when using one of mods i made. There is a discord server set up if you would like to chat with me in person - https://discord.gg/eEedA9Z
And afcourse donations are always wellcome! BURST address: BURST-S94A-Z3T5-TDZT-AK6NB

If using more than one mod please put Asset Exchange Trade Log mod js file import above other mods (checking for existence of previous mods was added later on, so if placed after other mods it would replace those mods)

### Mods list
- Asset Exchange Trade Log v1.0
  - Puts table on dashboard to show your last 10 trades in Asset Exchange - amounts are displayed from the perspective of users account.
- Reward Assigment Mod v1.1
  - Integrates Reward Assigment Modal into wallets UI (remodels Blocks Won box on dashboard). **_Known bug_**: Fee must be 1 BURST.
- SmartFee v1.0.1
  - Takes control of all transaction fees in wallet (except some parts that requires specific amounts and shouldnt be changed automatically). This mod will detect heavy load on network (by analyzing last block) and suggest a fee for a user to get priority in the next block. By default first time wallet is open after installation of this mod it will be disabled. To enable mod just press on the text "Disable SmartFee" **_(IE, EDGE has a known bug for not displaying checkbox near this text)_**. User can also choose in settings to enable SmartFee automatic fee management and if to ignore empty blocks. Both of these settings are enabled by default. If "Ignore Empty Blocks" enabled, mod will ignore empty blocks and use last known fee.
- Dividends system (BETA)
  - This repository also has additional code for my dividends system reachable by going to http://127.0.0.1:8125/paydivs.html . This is in beta and should be used at your own risk. If you decide to use it please let me know and also report any strange behaviour of this code. It should support assets with decimal places. It will always round down when calculating dividends per shares, also it handles some errors silently (logging them out into console), as i said - BETA :)

###

# Burstcoin

The world's first HDD-mined cryptocurrency using the new algorithm, Proof-of-Capacity.

## Striking Features

- Proof of Capacity - ASIC Proof / Energy efficient mining
- Fast sync. with multithread CPU or OpenCL/GPU (optional)
- "Turing complete" smart contracts, via Automated Transactions (AT) https://ciyam.org/at/at.html
- Decentralized Crowdfunding and Lottery via AT
- Asset Exchange and Digital Goods Store
- Advanced transactions: Escrow and Subscription
- Encrypted Messaging

## Specification

- NXT based
- Proof of Stake Removed
- Proof of Capacity implemented
- No IPO
- No Premine
- 4 minute block time
- 2,158,812,800 coins total
- Block reward starts at 10,000/block
- Block Reward Decreases at 5% each month

## Version History

- 2017/02/19 New version release Burst 1.2.8
- 2016/11/16 New version release Burst 1.2.7
- 2016/07/27 New version release Burst 1.2.6
- 2016/07/19 New version release Burst 1.2.5
- 2016/06/07 New version release Burst 1.2.4            
- 2016/01/11 Community takeover
- 2015/04/20 New version release Burst 1.2.3
- 2015/02/05 New version release Burst 1.2.2
- 2015/01/20 New version release Burst 1.2.1
- 2014/12/22 New version release Burst 1.2.0
- 2014/11/04 New version release 1.1.5
- 2014/10/18 New version release 1.1.4
- 2014/10/04 Escrow transactions enabled
- 2014/09/27 New version release 1.1.3
- 2014/09/14 New version release 1.1.2
- 2014/09/13 Stuck transactions statement
- 2014/09/13 New version release 1.1.1
- 2014/09/09 New version release 1.1.0
- 2014/08/31 V2 mining pool now up
- 2014/08/27 New version release 1.0.3
- 2014/08/20 First pool (v1) now up
- 2014/08/17 New version release 1.0.2
- 2014/08/16 Statement regarding the difficulty adjustment
- 2014/08/11 Statement regarding The pool situation

## Build

Burstcoin can be build using maven or the compile scripts within this repository.

## Links

For further information, please visit the following pages.

### Home
https://web.burst-team.us

### Block-Explorer
http://burstcoin.biz

### Forum
https://forums.burst-team.us

### Bitcointalk
https://bitcointalk.org/index.php?topic=1541310 *(New unmoderated)*

https://bitcointalk.org/index.php?topic=1323657 *(Alternative moderated)*

https://bitcointalk.org/index.php?topic=731923 *(Original unmoderated)*

### Related repositories
https://github.com/BurstProject *Original/Forked Burstcoin, ATDebugger, ATAssembler, POCMiner (Proof of concept plotter/miner), etc.*

https://github.com/IceBurst/Burst *Burst for Android*

https://github.com/dawallet/ *Burstcoin Win Client, Android App*

https://github.com/Blagodarenko  *Blago's XPlotter, Windows Miner, PlotsChecker, etc.*

https://github.com/de-luxe *GPU assisted jMiner, Faucet Software, Observer, AddressGenerator*

https://github.com/Creepsky/creepMiner *C++ Crossplatform Miner*

https://github.com/BurstTools/BurstSoftware *Windows Plot Generator for SEE4/AVX2*

https://github.com/bhamon *gpuPlotGenerator, BurstMine (graphical plotter/miner)*

https://github.com/kartojal *GUI for Dcct Tools, GUI for gpuPlotGenerator (linux)*

https://github.com/Kurairaito *Burst Plot Generator by Kurairaito*

https://github.com/Mirkic7 *Improved Linux Burst Plotter / optimizer / miner (linux)*

https://github.com/uraymeiviar *C Miner, Pool, Block Explorer, Plot Composer (linux)*

https://github.com/mrpsion/burst-mining-system *Web interface for Plotting and Mining*

### Additional Software
https://forums.burst-team.us/category/9/burst-software
