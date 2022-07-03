const { getNamedAccounts, ethers } = require("hardhat")

async function main() {
    const { deployer } = await getNamedAccounts()
    const fundMe = await ethers.getContract("FundMe", deployer)
    console.log("Funding Contract....")
    const txResponse = await fundMe.fund({
        value: ethers.utils.parseEther("0.05"),
    })
    await txResponse.wait()
    console.log("Funded")
}

main()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
