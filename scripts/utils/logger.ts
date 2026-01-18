import chalk from "chalk";

/**
 * Simple styled logger
 */
export default class Logger {
  static instance = console;

  static log(...data: any[]) {
    const style = chalk;
    Logger.instance.log(style.bold(">"), style(...arguments));
  }
  static info(...data: any[]) {
    const style = chalk.blue;
    Logger.instance.log(style.bold(">"), "Info:", style(...arguments));
  }
  static warn(...data: any[]) {
    const style = chalk.yellow;
    Logger.instance.log(style.bold(">"), "Warn:", style(...arguments));
  }
  static error(...data: any[]) {
    const style = chalk.red;
    Logger.instance.log(style.bold(">"), "Error:", style(...arguments));
  }
  static success(...data: any[]) {
    const style = chalk.green;
    Logger.instance.log(style.bold(">"), "Success:", style(...arguments));
  }
}
