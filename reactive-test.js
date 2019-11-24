/* 简易版模仿vue双向绑定 */
let data = {
    price: 2,
    quantity: 5
};
let target = null;
observer(data);

// 响应式主要需要三部分：
// Dep类：两个函数（发布者和订阅者）：notify和depend
// watcher函数：将使数据变化的函数存起来并更新数据
// defineProperty：get和set分别获取和重新赋值，同时在get时触发depend，set时触发notify订阅者；

function observer(obj) {
    obj.keys(obj).forEach(item => {
        let value = obj[item];
        let internalData = value;
        Object.defineProperty(obj, item, {
            get() {
                dep.depend();
                return internalData;
            },
            set(newValue) {
                if (newValue === internalData) return;
                internalData = newValue;
                console.log('进入set值变化了');
                dep.notify();
            }
        });
    });
}

class Dep {
    constructor () {
        this.subscribe = [];
    }
    depend() {
        if (target && !this.subscribe.includes(target)) {
            this.subscribe.push(target);
        }
    }
    notify() {
        this.subscribe.forEach(item => item());
    }
}

function watcher(myFun) {
    target = myFun;
    target();
    target = null;
}