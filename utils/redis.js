


class RedisClient{
    constructor(){
        this.client = redis.createClient();
        this.client.on('error', (error)=>
            console.error(`Redis client not connected to the server: ${error.message}`)
        );
    
    }
    isAlive(){
        return this.client.connected;
    }
    async get(key){
        return new Promise((resolve, reject) => {
            this.client.get(key, (err, value) => {
                if (err) reject(err);
                resolve(value);
            });
        }
        );
    }

    async setImmediate(key, value, duration){
        return new Promise((resolve, reject) => {
            this.client.setex(key, duration, value, (error, reply) => {
                if (error){
                    reject(error);
                }else{
                    resolve(reply);
                }
            });
        });
    }
    async del(key){
        return new Promise((resolve, reject) => {
            this.client.del(key, (error, reply) => {
                if (error){
                    reject(error);
                }else{
                    resolve(reply);
                }
            });
        });
    }
}
const redisClient = new RedisClient();
export default redisClient;
