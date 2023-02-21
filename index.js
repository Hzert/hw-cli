#!/usr/bin/env node

// console.log(process.argv);
const log = console.log;
import { Command } from 'commander'; //进行命令行的操作
import chalk from 'chalk'; // 提示文字
import logSymbols from 'log-symbols'; //提示符号
// import download from 'download-git-repo';  // //使用插件进行下载远程仓库的项目
// import ora from 'ora' //添加loading效果
// import handlebars from 'handlebars' //模板引擎 
import inquirer from 'inquirer'
import { templateObject } from './templates.js'
// import fs from 'fs' //node 内置模块 不需要单独引入
import {downLoadTemplate, initAndCloneProject, descriptionNextStep} from './tools.js'
const program = new Command();

/**
 * 
 * @param {*} templateObject 
 * @returns  当前模版数组
 */
const getTemplateList = (templateObject) => {
  let templateList = []
  for (let key in templateObject) {
    templateList.push(key)
  }
  return templateList
}

program.command('use').description('如何使用该cli').action(() => {
  log(logSymbols.info, chalk.yellow('第一步：运行 hw list'))
  log(logSymbols.info, chalk.yellow('第二步：运行 hw init 模板名称 自定义名称'))
  log(logSymbols.info, chalk.yellow('第三步：按照步骤初始化模板即可'))
})
program.command('list').description('可用的模板列表').action(() => {
  log(chalk.green('当前可用模板：\n'))
    for (let key in templateObject) {
      log(logSymbols.info, `模板名称：${key}`)
      log(logSymbols.info, `模板介绍：${templateObject[key].description}`)
      log(`\n`)
    }
})
program
  .command('init <templateName> <projectName>')
  .description('初始化模板')
  .action((templateName, projectName) => {
    downLoadTemplate(templateName, projectName).then(() => {
      inquirer
        .prompt([
          {
            type: 'input',
            name: 'name',
            message: "请输入项目名称"
          }, {
            type: 'input',
            name: 'description',
            message: "请输入项目简介"
          }, {
            type: 'input',
            name: 'author',
            message: "请输入作者"
          }
        ])
        .then((answers) => {
          initAndCloneProject(projectName, answers).then(() => {
            descriptionNextStep(projectName)
          })
        })
        .catch((error) => {
          if (error.isTtyError) {
            log(logSymbols.error, chalk.red(error))
          } else {
            log(logSymbols.error, chalk.yellow(error))
          }
        });
    })
  });

  program
  .command('help [command]')
  .description('帮助命令')

program
  .command('que')
  .description('询问')
  .action(() => {
    inquirer
      .prompt([
        {
          type: "confirm",
          name: "router",
          message: "是否安装路由?",
        },
        {
          type: "confirm",
          name: "eslint",
          message: "是否安装eslint?",
        },
        {
          type: "confirm",
          name: "pinia",
          message: "是否安装pinia",
        }
      ]).then(answers => {
        console.log(answers)
        // 写入文件
      }).catch(err => {
        console.log(err)
      })

  })

program
  .command('choice')
  .description('选择模板下载')
  .action(() => {
    inquirer
      .prompt([
        {
          type: "rawlist",
          name: "projectName",
          message: "请选择需要下载的模板",
          choices: getTemplateList(templateObject)
        }
      ]).then((answers) => {
        console.log(answers)
        downLoadTemplate(answers.projectName).then(() => {
          // 提示用户进入项目安装
          descriptionNextStep(answers.projectName)
        })
      }).catch(err => {
        console.log(err)
      })
  })

program.parse();
