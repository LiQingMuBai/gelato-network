// running `npx buidler test` automatically makes use of buidler-waffle plugin
// => only dependency we need is "chai"
const { expect } = require("chai");

// GelatoSysAdmin creation time variable values
import initialState from "./GelatoSysAdmin.initialState";

describe("GelatoCore - GelatoSysAdmin - Setters: FUNDS/STAKE", function () {
  // We define the ContractFactory and Signer variables here and assign them in
  // a beforeEach hook.
  let GelatoCore;
  let gelatoCore;
  let owner;
  let notOwner;

  beforeEach(async function () {
    // Get the ContractFactory, contract instance, and Signers here.
    GelatoCore = await ethers.getContractFactory("GelatoCore");
    gelatoCore = await GelatoCore.deploy();
    await gelatoCore.deployed();
    [owner, notOwner] = await ethers.getSigners();
  });

  // We test different functionality of the contract as normal Mocha tests.

  // setMinExecutorStake
  describe("GelatoCore.GelatoSysAdmin.setMinExecutorStake", function () {
    it("Should let the owner setMinExecutorStake", async function () {
      // Every transaction and call is sent with the owner by default
      await expect(gelatoCore.setMinExecutorStake(69420))
        .to.emit(gelatoCore, "LogSetMinExecutorStake")
        .withArgs(initialState.minExecutorStake, 69420);

      expect(await gelatoCore.minExecutorStake()).to.be.equal(69420);
    });

    it("Shouldn't let non-Owners setMinExecutorStake", async function () {
      // gelatoCore.connect returns the same GelatoCore contract instance,
      // but associated to a different signer
      await expect(
        gelatoCore.connect(notOwner).setMinExecutorStake(69420)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  // setMinProviderStake
  describe("GelatoCore.GelatoSysAdmin.setMinProviderStake", function () {
    it("Should let the owner setMinProviderStake", async function () {
      // Every transaction and call is sent with the owner by default
      await expect(gelatoCore.setMinProviderStake(69420))
        .to.emit(gelatoCore, "LogSetMinProviderStake")
        .withArgs(initialState.minProviderStake, 69420);

      expect(await gelatoCore.minProviderStake()).to.be.equal(69420);
    });

    it("Shouldn't let non-Owners setMinProviderStake", async function () {
      // gelatoCore.connect returns the same GelatoCore contract instance,
      // but associated to a different signer
      await expect(
        gelatoCore.connect(notOwner).setMinProviderStake(69420)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  // withdrawSysAdminFunds
  describe("GelatoCore.GelatoSysAdmin.withdrawSysAdminFunds", function () {
    it("Should let the owner withdrawSysAdminFunds", async function () {
      // Every transaction and call is sent with the owner by default
      await expect(gelatoCore.withdrawSysAdminFunds(0))
        .to.emit(gelatoCore, "LogWithdrawSysAdminFunds")
        .withArgs(initialState.sysAdminFunds, 0);

      expect(await gelatoCore.sysAdminFunds()).to.be.equal(0);
    });

    it("Shouldn't let the owner withdraw non-existant funds", async function () {
      // Every transaction and call is sent with the owner by default
      await expect(gelatoCore.withdrawSysAdminFunds(69420))
        .to.emit(gelatoCore, "LogWithdrawSysAdminFunds")
        .withArgs(initialState.sysAdminFunds, 0);

      expect(await gelatoCore.sysAdminFunds()).to.be.equal(0);
    });

    it("Shouldn't let non-Owners withdrawSysAdminFunds", async function () {
      // gelatoCore.connect returns the same GelatoCore contract instance,
      // but associated to a different signer
      await expect(
        gelatoCore.connect(notOwner).withdrawSysAdminFunds(0)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });
});
