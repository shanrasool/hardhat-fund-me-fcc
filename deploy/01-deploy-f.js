const { getNamedAccounts, deployments, network } = require("hardhat")
const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

module.exports = async () => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    // const ethUsdPFAdd = networkConfig[chainId]["ethUsdPriceFeed"]

    let ethUsdPFAdd
    if (chainId == 31337) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPFAdd = ethUsdAggregator.address
    } else {
        ethUsdPFAdd = networkConfig[chainId]["ethUsdPriceFeed"]
    }

    const args = [ethUsdPFAdd]
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMe.address, args)
    }
    log("===================================================================")
}

module.exports.tags = ["all", "fundme"]
