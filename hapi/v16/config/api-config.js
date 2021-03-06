/** api 接口配置 */
const Joi = require('joi');

/** hapi 请求限制 */
exports.API = 'api';
exports.methods = {
    get: 'GET',
    post: 'POST',
    patch: 'PATCH',
    delete: 'DELETE',
};

/** hapi 框架配置 */
exports.hapiConfig = {
    connections: [
        // 接口网址/配置文件:/.env 主机名和端口号
        { labels: PKG.name, host: ENV.HOST, port: ENV.POST },
    ],
    serverOptions: {
        // 全局变量/配置 > 在路由中访问 request.server.app.name
        app: { name: PKG.name },
        // 缓存/配置 > 在路由中访问 request.server.cache.get
        cache: [
            {
                engine: require('catbox-memory'), // require('catbox-redis'),
                name: 'default-cache', partition: 'hapi-cache', shared: false
            }
        ],
        // 运行时/配置
        connections: {
            compression: true, // 启用 gzip 压缩
            load: {
                maxHeapUsedBytes: 0, // 内存使用大小(0表示不限制)
                maxRssBytes: 0,
                maxEventLoopDelay: 0
            },
            router: {
                isCaseSensitive: false, // 路由 不 区分大小写
                stripTrailingSlash: false
            },
            routes: {
                // auth: '',
            },
            // log: true,
        },
        // 调试模式/开启日志输出
        debug: {
            log: ['error'],
            // log: ['auth', 'unauthenticated', 'error', 'jwt'],
            // request: ['error']
        },
        load: {
            // sampleInterval: 10
        }
    }
};

/** 过期限制(输入s秒n时/输出毫秒) */
exports.exp = (s = 0, n = 0) => s * 1000 + (n == 0 ? Date.now() : n);

/** 请求参数验证 */
exports.validate = {
    /**
     * 分页查询: page=1&limit=10
     * @param limit 每页的条目数:默认10
     * @param pagination 开启分页:默认true
     */
    pager: (limit = 10, pagination = true) => {
        return {
            page: Joi.number().integer().min(1).default(1).description('页码数:默认1'),
            limit: Joi.number().integer().min(1).default(limit).description('每页的条目数:默认10'),
            pagination: Joi.boolean().default(pagination).description('开启分页:默认true'),
        };
    },
    /**
     * 输入headers/authorization: 基于 JWT 的用户身份验证
     */
    jwt: {
        headers: Joi.object({
            authorization: Joi.string().required().description('token'),
        }).unknown(), // 冗余处理
    }
};
