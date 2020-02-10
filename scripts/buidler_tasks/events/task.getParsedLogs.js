import { task, types } from "@nomiclabs/buidler/config";
import { defaultNetwork } from "../../../buidler.config";

export default task(
  "event-getparsedlogs",
  `Return (or --log) the provider's parsed logs for <contractname> <eventname> --fromBlock --toBlock or --blockHash  [--network] (default: ${defaultNetwork})`
)
  .addPositionalParam(
    "contractname",
    "Must be in config.networks.[--network].contracts"
  )
  .addPositionalParam(
    "eventname",
    "The name of the event in the <contractname>'s abi"
  )
  .addOptionalParam(
    "fromblock",
    "the block number to search for event logs from",
    undefined,
    types.number
  )
  .addOptionalParam(
    "toblock",
    "the block number up until which to look for",
    undefined,
    types.number
  )
  .addOptionalParam("blockhash", "the blockhash in which")
  .addOptionalParam("txhash", "filter for a specific tx")
  .addOptionalParam("value", "a specific value to search for")
  .addFlag("values")
  .addFlag("stringify")
  .addFlag("log", "Logs return values to stdout")
  .setAction(async taskArgs => {
    try {
      if (taskArgs.value && taskArgs.values)
        throw new Error("Cannot search for --value and --values");
      if (taskArgs.stringify && !taskArgs.value)
        throw new Error("--stringify only supplements --value");

      let loggingActivated;
      if (taskArgs.log) {
        loggingActivated = true;
        taskArgs.log = false;
      }

      let logs, logWithTxHash;
      if (taskArgs.txhash) logWithTxHash = await run("event-getlogs", taskArgs);
      else logs = await run("event-getlogs", taskArgs);

      if (loggingActivated) taskArgs.log = true;

      let parsedLogs, parsedLogWithTxHash;
      if (logWithTxHash) {
        parsedLogWithTxHash = await run("ethers-interface-parseLogs", {
          contractname: taskArgs.contractname,
          logs: logWithTxHash
        });
      } else {
        parsedLogs = await run("ethers-interface-parseLogs", {
          contractname: taskArgs.contractname,
          logs
        });
      }

      if (!parsedLogs && !parsedLogWithTxHash) {
        if (taskArgs.log) {
          console.log(
            `No logs for ${taskArgs.contractname}.${taskArgs.eventname}`
          );
          return [];
        }
      } else {
        if (!taskArgs.txhash) {
          if (taskArgs.log) {
            console.log(
              `Parsed Logs for ${taskArgs.contractname}.${taskArgs.eventname}`
            );
          }
          if (taskArgs.values) {
            const parsedLogsValues = [];
            for (const parsedLog of parsedLogs) {
              if (taskArgs.log) console.log("\n", parsedLog.values);
              parsedLogsValues.push(parsedLog.values);
            }
            return parsedLogsValues;
          } else if (taskArgs.value) {
            const parsedLogsValue = [];
            for (const parsedLog of parsedLogs) {
              if (taskArgs.log) {
                console.log(
                  `\n ${taskArgs.value}: `,
                  taskArgs.stringify
                    ? parsedLog.values[taskArgs.value].toString()
                    : parsedLog.values[taskArgs.value]
                );
              }
              parsedLogsValue.push(
                taskArgs.stringify
                  ? parsedLog.values[taskArgs.value].toString()
                  : parsedLog.values[taskArgs.value]
              );
            }
            return parsedLogsValue;
          } else {
            for (const parsedLog of parsedLogs)
              if (taskArgs.log) console.log("\n", parsedLog);
            return parsedLogs;
          }
        } else {
          // txhash
          if (taskArgs.values) {
            if (taskArgs.log) console.log("\n", parsedLogWithTxHash[0].values);
            return parsedLogWithTxHash[0].values;
          } else if (taskArgs.value) {
            if (taskArgs.log) {
              console.log(
                `\n ${taskArgs.value}: `,
                taskArgs.stringify
                  ? parsedLogWithTxHash[0].values[taskArgs.value].toString()
                  : parsedLogWithTxHash[0].values[taskArgs.value]
              );
            }
            return taskArgs.stringify
              ? parsedLogWithTxHash[0].values[taskArgs.value].toString()
              : parsedLogWithTxHash[0].values[taskArgs.value];
          } else {
            if (taskArgs.log) {
              console.log(
                `Parsed Log for ${taskArgs.contractname}.${taskArgs.eventname} with tx-Hash ${taskArgs.txhash}:\
                 \n`,
                parsedLogWithTxHash
              );
            }
            return parsedLogWithTxHash;
          }
        }
      }
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  });