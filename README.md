# 容器化实战演练（demo.docker）
> 下面教程分步骤演示如何将项目用容器化方式运行起来，重在演示，抛砖引玉，不过多深入。

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

## step3：让server访问redis
> 本节演示添加针对redis的访问，包括向redis设置值和从redis取值；为下一节docker-compose演示做准备。

1、添加操作redis依赖的客户端库
```
cnpm install ioredis --save
```

2、添加代码（在index.js中）
```
var Redis = require("ioredis");
// 环境变量支持
var addr = process.env.ENV == 'prd' ? "demo-redis" : "localhost";
var redisClient = new Redis(6379, addr);

// redis set
router.get('/set', function (req, res, next) {
  redisClient.set(req.query.key, req.query.val);
  res.json({
    success: true,
    action: 'set',
    data: {
      [req.query.key]: req.query.val
    }
  });
});

// redis get
router.get('/get', function (req, res, next) {
  redisClient.get(req.query.key, function (err, result) {
    if (err) {
      res.json({
        success: false,
        data: err
      });
    } else {
      res.json({
        success: true,
        action: 'get',
        data: {
          [req.query.key]: result
        }
      });
    }
  });
});
```

3、执行`npm start`运行起来，访问下面API操作redis
- 设置值：http://localhost:3000/set?key=kkk&val=vvv
- 获取值：http://localhost:3000/get?key=kkk

---

本节演练结束，有兴趣深入学习，可参考：
- ioredis: https://www.npmjs.com/package/ioredis

## step4：docker-compose运行起来（配置式）
> 本节演示通过docker-compose配置文件，将server和redis整体进行一体化运行。

1、添加docker-compose.yml配置文件
```
version: "3.8"
services:
  app:
    env_file:
      - app.${ENV}.env
    build:
      context: .
      labels:
        - "app=demo"
    image: demo-docker:v1
    networks:
      - backend
    ports:
      - "3000:3000"
    depends_on:
      - "redis"
  redis:
    image: redis:latest
    networks:
      backend:
        aliases:
          - "demo-redis"

networks:
  backend:
```

2、添加上面配置文件需要的环境变量支持
- 添加`app.prd.env`，配置文件中依赖加载的环境变量文件，会注入到构建的镜像中
```
ENV=prd
XXX=YYY
```
- 添加`.env`，docker-compose up时会自动加载该文件中环境变量
```
ENV=prd
```

3、执行下面命令运行起来
```
docker-compose up
```

4、访问下面API操作redis
- 设置值：http://localhost:3000/set?key=kkk&val=vvv
- 获取值：http://localhost:3000/get?key=kkk
- 获取环境变量：http://localhost:3000/env

---

本节演练结束，有兴趣深入学习，可参考：
- docker-compose cmd: https://docs.docker.com/compose/reference/overview/
- docker-compose file: https://docs.docker.com/compose/compose-file/

## step5：docker swarm运行起来（指令式）
> 本机演练通过指令在swarm集群中运行服务，包括扩缩容。

1、自己构建一个镜像备用
```
docker build -t demo-docker .
```

2、初始化swarm集群模式
> 如果先前已经加入过，可以先离开：`docker swarm leave -f`

```
docker swarm init
```

3、创建一个网络
```
docker network create -d overlay demo
```
```
docker network ls
```

4、创建一个**demo-redis**服务
```
docker service create --name demo-redis --network demo redis:latest
```
```
docker service ls
```

5、基于第一步构建的镜像创建一个**demo-docker**服务
```
docker service create --name demo-app -p 9000:3000 -e ENV=prd --network demo demo-docker:latest
```
```
docker service ls
```

6、访问下面API操作redis
- 设置值：http://localhost:9000/set?key=kkk&val=vvv
- 获取值：http://localhost:9000/get?key=kkk
- 获取环境变量：http://localhost:9000/env

7、扩容
```
docker service scale demo-redis=2
```
```
docker service ls
```

---

本节演练结束，有兴趣深入学习，可参考：
- docker swarm cmd: https://docs.docker.com/engine/swarm/
- docker service cmd: https://docs.docker.com/engine/reference/commandline/service/

## step6：docker stack运行起来（配置式）


## step7：k8s运行起来（配置式）

