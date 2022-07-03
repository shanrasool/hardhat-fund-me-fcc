const { assert, expect } = require("chai")
const { deployments, ethers, getNamedAccounts } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async function () {
          let fundMe
          let deployer
          let mockV3Aggregator
          const sendValue = ethers.utils.parseEther("0.1")
          beforeEach(async function () {
              // const accounts = await ethers.getSigners()
              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture(["all"])
              fundMe = await ethers.getContract("FundMe", deployer)
              mockV3Aggregator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer
              )
          })

          describe("constructor", async function () {
              it("sets the aggregator addresses correctly", async function () {
                  const response = await fundMe.s_priceFeed()
                  assert.equal(response, mockV3Aggregator.address)
              })
          })

          describe("fund", async function () {
              it("Fails if you don't send enough ETH", async () => {
                  await expect(fundMe.fund()).to.be.reverted
              })

              it("Updates the the amount funded", async function () {
                  await fundMe.fund({ value: sendValue })
                  const response = await fundMe.s_addressToAmount(deployer)
                  assert.equal(response.toString(), sendValue.toString())
              })

              it("Adds funder to array of funders", async function () {
                  await fundMe.fund({ value: sendValue })
                  const res = await fundMe.s_funders(0)
                  assert.equal(res, deployer)
              })
          })

          describe("withdraw", async function () {
              beforeEach(async () => {
                  await fundMe.fund({ value: sendValue })
              })
              it("withdraws ETH from a single funder", async function () {
                  const startConBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const startDepBalance = await fundMe.provider.getBalance(
                      deployer
                  )

                  const txRes = await fundMe.withdraw()
                  const txReceipt = await txRes.wait()
                  const { gasUsed, effectiveGasPrice } = txReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const endConBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endDepBalance = await fundMe.provider.getBalance(
                      deployer
                  )
                  assert.equal(endConBalance, 0)
                  assert.equal(
                      startConBalance.add(startDepBalance).toString(),
                      endDepBalance.add(gasCost).toString()
                  )
              })

              it("allows us to withdraw with multiple s_funders", async function () {
                  const accounts = await ethers.getSigners()
                  for (i = 1; i < 6; i++) {
                      const connectedContract = await fundMe.connect(
                          accounts[i]
                      )
                      await connectedContract.fund({ value: sendValue })
                  }
                  const startConBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const startDepBalance = await fundMe.provider.getBalance(
                      deployer
                  )
                  const txRes = await fundMe.withdraw()
                  const txReceipt = await txRes.wait()
                  const { gasUsed, effectiveGasPrice } = txReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const endConBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endDepBalance = await fundMe.provider.getBalance(
                      deployer
                  )

                  assert.equal(endConBalance, 0)
                  assert.equal(
                      startConBalance.add(startDepBalance).toString(),
                      endDepBalance.add(gasCost).toString()
                  )

                  await expect(fundMe.s_funders(0)).to.be.reverted

                  for (i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.s_addressToAmount(accounts[i].address),
                          0
                      )
                  }
              })

              it("Only allows the owner to withdraw", async function () {
                  const accounts = await ethers.getSigners()
                  const connectedContract = await fundMe.connect(accounts[1])
                  await expect(connectedContract.withdraw()).to.be.reverted
              })
          })

          describe("Cheaper withdraw", async function () {
              beforeEach(async () => {
                  await fundMe.fund({ value: sendValue })
              })
              it("withdraws ETH from a single funder", async function () {
                  const startConBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const startDepBalance = await fundMe.provider.getBalance(
                      deployer
                  )

                  const txRes = await fundMe.cheaperWithdraw()
                  const txReceipt = await txRes.wait()
                  const { gasUsed, effectiveGasPrice } = txReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const endConBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endDepBalance = await fundMe.provider.getBalance(
                      deployer
                  )
                  assert.equal(endConBalance, 0)
                  assert.equal(
                      startConBalance.add(startDepBalance).toString(),
                      endDepBalance.add(gasCost).toString()
                  )
              })

              it("allows us to withdraw with multiple s_funders", async function () {
                  const accounts = await ethers.getSigners()
                  for (i = 1; i < 6; i++) {
                      const connectedContract = await fundMe.connect(
                          accounts[i]
                      )
                      await connectedContract.fund({ value: sendValue })
                  }
                  const startConBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const startDepBalance = await fundMe.provider.getBalance(
                      deployer
                  )
                  const txRes = await fundMe.withdraw()
                  const txReceipt = await txRes.wait()
                  const { gasUsed, effectiveGasPrice } = txReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const endConBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endDepBalance = await fundMe.provider.getBalance(
                      deployer
                  )

                  assert.equal(endConBalance, 0)
                  assert.equal(
                      startConBalance.add(startDepBalance).toString(),
                      endDepBalance.add(gasCost).toString()
                  )

                  await expect(fundMe.s_funders(0)).to.be.reverted

                  for (i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.s_addressToAmount(accounts[i].address),
                          0
                      )
                  }
              })

              it("Only allows the owner to withdraw", async function () {
                  const accounts = await ethers.getSigners()
                  const connectedContract = await fundMe.connect(accounts[1])
                  await expect(connectedContract.withdraw()).to.be.reverted
              })
          })
      })
