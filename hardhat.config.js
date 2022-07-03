require("dotenv").config()

require("@nomiclabs/hardhat-etherscan")
require("@nomiclabs/hardhat-waffle")
require("hardhat-gas-reporter")
require("solidity-coverage")
require("hardhat-deploy")

const RINKEBY_RPC_URL =
    process.env.RINKEBY_RPC_URL ||
    "https://eth-mainnet.alchemyapi.io/v2/your-api-key"

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || ""
const PRIVATE_KEY =
    process.env.PRIVATE_KEY ||
    "0x11ee3108a03081fe260ecdc106554d09d9d1209bcafd46942b10e02943effc4a"

module.exports = {
    solidity: {
        compilers: [{ version: "0.8.4" }, { version: "0.6.6" }],
    },
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            chainId: 31337,
        },
        rinkeby: {
            url: RINKEBY_RPC_URL,
            accounts: [PRIVATE_KEY],
            chainId: 4,
            blockConfirmations: 6,
        },
    },
    gasReporter: {
        enabled: true,
        currency: "USD",
        outputFile: "gas-report.txt",
        noColors: true,
    },
    etherscan: {
        apiKey: process.env.ETHERSCAN_API_KEY,
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
    },
}
