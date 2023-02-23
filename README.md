#### 初始化一个 package.json

```base
npm init 或者 npm init -y
```

#### 初始化一个测试文件

```js
#!/usr/bin/env node
console.log("function is success");
```

> **特殊说明：** #!/usr/bin/env node 这里是必须要加的，如果你实在不理解，那么你可以先这样写，另外就是这行代码必须是第一行，他的前面不可以有任何代码 当然这里也可以解释一下，你可以简单的理解为增加这一行是为了指定用 node 执行脚本文件。如果想深入理解这个东西，可以看一下大神的介绍[Shebang](https://blog.csdn.net/u012294618/article/details/78427864) 希望可以有点帮助

#### 运行该文件

```base
node index.js
```

#### 将 node index.js 替换为自定义命令

##### 比如：hw

我们的目的是，当我们输入 hw 的时候 执行的是 node index.js 这句话即可

#### 配置 package.json

```json
{
  "name": "hw-cli",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "",
  "license": "ISC",
  "bin": {
    "hw": "index.js"
  }
}
```

###### bin 命令 说明

> "bin": {
> "hw":"index.js"
> }
>
> 这里的 bin 就是我们需要使用的终端命令，后面的文件就是我们指定的 mjs 文件，当然这个文件你可以自己封装，只要是一个入口文件就可以，vue-cli 源码这里指向的就是一个 bin 文件

#### 发布该命令

```base
npm link  // 将bin脚本下的命令进行发布到本地，本地就可以使用bin脚本中的命令
```

#### 效果

```base
hw
function is success
```

#### 注意事项

> 需要被执行的文件需要使用#!/usr/bin/env node 进行声明 否则是不生效的，该命令是映射到全局的，所以你在任何地方都是可以直接进行使用该命令的，就和你使用 vue-cli 是一样的效果

#### 移除 link

```base
npm unlink  // 注意这里必须在项目文件中执行，不可以全局执行
```

### 实现过程

#### 脚本命令参数设计

```base
hw --help 查看使用帮助
hw -V |--version 查看工具版本号
hw list  列出所有可用模板
hw inti <template-name> <project-name> 基于制定模板进行项目初始化 <> 代表的是必填项
```

> 下面的操作都是服务于上面 👆 这段参数设计，首先是我们已经将 hw 的命令执行到本地，npm link 已经完成了我们需要的第一步，后面就是这么在我们输入 hw 之后的命令进行操作，首先我们需要将 hw 后面输入的操作捕捉到，其实 node 提供给我们了原始的操作方式，比如下面

```js
log(process.argv) // 我全局声明了 const log = console.log;  所以这里直接使用了log
输入：hw iii
leimingwei@leimingweideMBP vue-cli-xa % hw iii
[
  '/Users/leimingwei/.nvm/versions/node/v16.13.2/bin/node',
  '/Users/leimingwei/.nvm/versions/node/v16.13.2/bin/xa',
  'iii'
]
error: unknown command 'iii'
(Did you mean init?)
```

> 可以看到当我们输入命令之后，node 自带的 process.argv 是可以将我们输入的参数捕捉到的，但是这种写法我们是很难将用户的所有操作进行处理的，所以我们需要一个工具类来代替我们做这件事，那么这个工具就是 commander

#### 执行用户输入的命令行操作

```base
yarn add commander // 安装commander工具
import { Command } from 'commander'; //进行命令行的操作
const program = new Command();
```

- [commanderGithub 地址](https://github.com/commander-rb/commander)

###### 使用

```js
program
  .command("use") // 此处就是定义用户的输入
  .description("如何使用该cli") // 当用户输入-h 的时候提示的描述信息
  // 接受到用户输入的命令之后进行的操作
  .action(() => {
    log(logSymbols.info, chalk.yellow("第一步：运行 hw list"));
    log(
      logSymbols.info,
      chalk.yellow("第二步：运行 hw init 模板名称 自定义名称")
    );
    log(logSymbols.info, chalk.yellow("第三步：按照步骤初始化模板即可"));
  });
program.parse();
```

##### 效果展示：

```base
ℹ 第一步：运行 hw list
ℹ 第二步：运行 hw init 模板名称 自定义名称
ℹ 第三步：按照步骤初始化模板即可
```

> 有了上述工具之后我们可以做的事情就比较多了，首先可以自定义指令，之后可以根据自定义指令进行 action 的操作，action 中有回调参数，可以获取到当前用户的操作结果，具体的使用说明可以看 🔝 上方提供的 github 链接中的说明文档，这里不做赘述

###### 说明

> 该功能插件提供很多命令操作和很多选项操作，可以自己进行定义一些功能操作，比如获取到用户输入的命令进行下载或者执行一些动作都是可以的

###### 下载用户想要的文件

> 用户的命令我们已经获取到了，这个时候我们需要进行根据用户的要求下载对应的仓库才可以，这里我们没办法直接使用 git clone 下载，所以我们需要使用第三方的下载工具，download-git-repo 该工具可以帮助我们直接下载我们提供好的 git 下载地址

- [download-git-repo](https://www.npmjs.com/package/download-git-repo)

###### git-repo 基本使用

```js
yarn add downlaod-git-repo
import download from 'download-git-repo';

```

```js
const downloadUrl = "地址";
// PN || TN 是我的入参 你们可以直接写死自己需要的项目名字
download(downloadUrl, PN || TN, { clone: true }, (err) => {
  const spinner = ora("模板获取中...").start(); // ora后面会说到 一个加载动画
  if (err) {
    spinner.color = "red";
    spinner.text = `模板获取失败，请重新操作,失败原因：${err}`;
    spinner.fail();
    return;
  }
  spinner.color = "green";
  spinner.text = "模板下载成功";
  spinner.succeed();
});
```

###### 限制用户输入操作和选择的脚本

> 当我们可以知道了用户输入的命令了 ，那么之后我们要做的就是这么可以让用户有选择和询问的效果，比如：是否安装路由？是否安装 pinia 等等操作，还有一些是给用户选择，比如你是安装 vue2 还是 vue3 等，这个功能需要我们使用另一个工具进行实现，inquirer 工具

- [inquirer-github](https://github.com/SBoudrias/Inquirer.js)

###### inquirer 的基本使用

```js
inquirer
  .prompt([
    {
      type: "input",
      name: "name",
      message: "请输入项目名称",
    },
    {
      type: "input",
      name: "description",
      message: "请输入项目简介",
    },
    {
      type: "input",
      name: "author",
      message: "请输入作者",
    },
  ])
  .then((answers) => {
    log.log(answers);
  })
  .catch((error) => {
    if (error.isTtyError) {
      log(logSymbols.error, chalk.red(error)); // 这里的logSymbols 和 chalk 后面会说到
    } else {
      log(logSymbols.error, chalk.yellow(error));
    }
  });
```

###### 重写 package.json 文件

> 当我们拿到了用户的输入，也将模板下载好了，也已经让用户自己输入了自定义的内容，那么下一步就是怎么将用户输入好的东西进行重新写入到我们下载好的项目中，当然不需要我们自己手写，需要我们引入第三方的工具 handlebars 和 node 内置的 fs 文件操作模块

- [handlebars](https://github.com/handlebars-lang/handlebars.js)

###### handlebars 的基本使用

```js
yarn add handlebars
import handlebars from 'handlebars' //模板引擎
import fs from 'fs' //node 内置模块 不需要单独引入
```

###### 重写 json

```js
const packagePath = `${PN}/package.json`; //PN 文件名字
const packageContent = fs.readFileSync(packagePath, "utf8");
const packageFinalValue = handlebars.compile(packageContent)(PC);
log(chalk.green(packageFinalValue));
fs.writeFileSync(packagePath, packageFinalValue);
```

###### json 配置

> 当然只是重写还是不够的，需要我们的 package.json 进行配置，

```json
{
  "name": "{{name}}",
  "author": "{{author}}",
  "description": "{{description}}",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "license": "ISC",
  "bin": {
    "hw": "index.js"
  },
  "{{dependencies}}": {
    "commander": "^9.4.1",
    "download-git-repo": "^3.0.2",
    "handlebars": "^4.7.7",
    "inquirer": "^9.1.4",
    "router": "{{router}}",
    "pinia": "{{pinia}}"
  },
  "{{devDependencies}}": {}
}
```

> 我们需要进行重写的地方需要使用胡须模板进行变量接收参数

###### 美化操作

上面提到的 ora\chalk\logSymbols 都是用来美化用户操作的，这里可以简单的理解为操作的界面更加舒适！

```js
import ora from "ora"; //添加loading效果
import chalk from "chalk"; // 提示文字
import logSymbols from "log-symbols"; //提示符号
```

###### 具体使用

- [ora](https://github.com/sindresorhus/ora)
- [chalk](https://github.com/chalk/chalk)
- [logSymbols](https://github.com/guumaster/logsymbols)
