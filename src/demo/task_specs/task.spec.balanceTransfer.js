import { task, types } from "@nomiclabs/buidler/config";
import { constants, utils } from "ethers";

export default internalTask(
  "gelato-return-taskpec-balance-transfer",
  `Returns a hardcoded task spec for the timeTrade Script`
)
  .addFlag("log")
  .setAction(async ({ log }) => {
    try {
      // ##### Condition
      const conditionAddress = await run("bre-config", {
        deployments: true,
        contractname: "ConditionBalanceStateful",
      });

      const condition = new Condition({
        inst: conditionAddress, // Address of the ConditionTimeStateful.sol
      });

      // ##### Action #1
      // 1. Get address from deployments.rinkeby file / or hardcode it
      const actionAddress = await run("bre-config", {
        deployments: true,
        contractname: "ActionERC20TransferFrom",
      });

      const action1 = new Action({
        addr: actionAddress,
        data: constants.HashZero, // data is can be left as 0 for Task Specs
        operation: Operation.Delegatecall, // We are using an action Script here, see smart contract: ActionERC20TransferFrom.sol
        dataFlow: DataFlow.None, // Only relevant if this action should return some value to the next, which it not necessary here
        value: 0, // always 0 for delegate calls
        termsOkCheck: true, // After the condition is checked, we will also conduct checks on the action contract
      });

      // ##### Action #2
      const action2 = new Action({
        addr: conditionAddress, // We use the condition as an action (to dynamically set the timestamp when the users proxy contract can execute the actions next time)
        data: constants.HashZero, // data is can be left as 0 for Task Specs
        dataFlow: DataFlow.None, // Only relevant if this action should return some value to the next, which it not necessary here
        value: 0, // we are not sending any eth here, so value = 0
        operation: Operation.Call, // We are calling the contract instance directly, without script
        termsOkCheck: false, // Always input false for actions we .call intp
      });

      // ##### Create Task Spec
      const taskSpec = new TaskSpec({
        conditions: [condition.inst], // only need the condition inst address here
        actions: [action1, action2], // Actions will be executed from left to right after each other. If one fails, all fail
        gasPriceCeil: 0, // Here providers can set the maximum gas price they are willing to pay. Set to 0 to allow any gas price
      });

      console.log(taskSpec);

      return taskSpec;
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  });
