/* observer 模块：
*  监听所有对象数据的变化，若变动，及时将最新值通知订阅者
*/
function Observer(data) {
    this.data = data;
    this.walk(data);
}

Observer.prototype = {
    constructor: Observer,
    walk(data) {
        let self = this;
        Object.keys(data).forEach(key => {
            self.defineReactive(data, key, data[key]);
        })
    },
    defineReactive(data, key, val) {
        let dep = new Dep();
        let childObj = observe(val);

        Object.defineProperty(data, key, {
            enumerable: true,
            configurable: false,
            get() {
                if (Dep.target) {
                    // 添加订阅
                    dep.depend();
                }
                return val;
            },
            set(newVal) {
                if (val === newVal) {
                    return;
                }
                val = newVal;
                // 新值如果是object，进行监听
                childObj = observe(newVal);
                // 发布通知
                dep.notify();
            }
        })
    }
}

function observe(val, vm) {
    if (!val || typeof val !== 'object') {
        return;
    }
    return new Observer(val);
}

var uid = 0;

function Dep() {
    this.id = uid++;
    this.subs = [];
}

Dep.prototype = {
    addSub(sub) {
        this.subs.push(sub);
    },
    depend() {
        Dep.target.addDep(this);
    },
    removeSub(sub) {
        let index = this.subs.indexOf(sub);
        if (index !== -1) {
            this.subs.splice(index, 1);
        }
    },
    notify() {
        this.subs.forEach(sub => {
            sub.update();
        })
    }
}

Dep.target = null;