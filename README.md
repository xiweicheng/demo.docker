# demo.docker

## step1：本地运行简单server
> 本节使用的是极简单的express node server，仅供演练；运行成功，通过浏览器访问会看到一句欢迎语。

1、按照依赖，根目录下执行：
```
npm install
```

2、如果本机安装cpm，执行（国内镜像，更快）：
```
cnpm install
```

3、访问：http://localhost:3000/  
你应该会看到: `"Hello, I'm a server response."`

---

本节演练结束，有兴趣深入学习，可参考：
- nodejs: https://nodejs.org/zh-cn/
- express: http://expressjs.com/
- cnpm: https://developer.aliyun.com/mirror/NPM?from=tnpm

## step2：docker运行起来（指令式）
> 本节是将step1中工程构建成一个docker镜像，然后以容器化形式运行起来；运行成功，通过浏览器访问会看到step1中相同的欢迎语。

1、添加构建配置文件：`Dockerfile`
```
FROM node:8.9
RUN mkdir /app
WORKDIR /app
COPY . ./
RUN npm install -g cnpm --registry=https://registry.npm.taobao.org && cnpm install
EXPOSE 3000
CMD ["npm", "start"]
```

2、根据上步的配置文件编译构建镜像
- 添加一个docker的忽略文件：`.dockerignore`
添加下面目录名称，作用是在构建镜像时复制文件时忽略它。
```
node_modules/
```
- 执行构建命令：
```
docker build -t demo-docker:v1 .
```
- 执行命令查看构建的镜像：
```
docker images|grep demo
```

3、执行命令基于构建的镜像将容器运行起来
```
docker run --rm -p 3000:3000 demo-docker:v1
```

4、访问：http://localhost:3000/  
你应该会看到: `"Hello, I'm a server response."`

---

本节演练结束，有兴趣深入学习，可参考：
- docker: https://docs.docker.com/
- Dockerfile: https://docs.docker.com/engine/reference/builder/
- docker cmd: https://docs.docker.com/engine/reference/run/
