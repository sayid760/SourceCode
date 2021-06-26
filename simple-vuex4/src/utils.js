// 把对象拼接成新的参数，传给fn函数
export function forEachValue(obj, fn){
    Object.keys(obj).forEach(key=>fn(obj[key], key))
}