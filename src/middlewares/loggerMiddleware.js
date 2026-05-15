//middleware to log all requests before processing, logs are displayed with date + endpoints
export default function logger(req, res, next){
    const data = new Date().toLocaleString()
    console.log(`[${data}] ${req.method} ${req.url}`)
    next()
};