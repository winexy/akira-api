import * as chalk from 'chalk'

function logfunc(scope: string, color: chalk.Chalk) {
  return (message: string, ...args: unknown[]) => {
    console.log(color(`[${scope}] ${message}`), ...args)
  }
}

export const logger = (scope: string) => ({
  error: logfunc(scope, chalk.red),
  info: logfunc(scope, chalk.gray),
  success: logfunc(scope, chalk.green)
})
