/* watcher 模块：
*  连接 observer 和 compile 的桥梁，订阅并收到每个属性的变动通知，执行指令绑定的相应函数，并触发视图更新
*/

class Watcher {
    constructor(vm, expOrFn, cb) {
        this.vm = vm;
        this.cb = cb;
        this.expOrFn = expOrFn;
        this.depIds = {};

        if (typeof expOrFn === 'function') {
            this.getter = expOrFn;
        } else {
            this.getter = this.parseGetter(expOrFn.trim());
        }

        this.value = this.get();
    }

    parseGetter(exp) {
        let reg = /[^\w.$]/;
        if (reg.test(exp)) return;
        let exps = exp.split('.');
        
        return (function(obj) {
            for (let i=0, len=exps.length; i<len; i++) {
                if (!obj) return;
                obj = obj[exps[i]];
            }
            return obj;
        })
    }

    update() {
        this.run();
    }

    run() {
        let value = this.get();
        let oldValue = this.value;

        if (oldValue !== value) {
            this.value = value;
            this.cb.call(this.vm, value, oldValue);
        }
    }

    get() {
        Dep.target = this;
        let value = this.getter.call(this.vm, this.vm);
        Dep.target = null;
        return value;
    }

    addDep(dep) {
        if (!this.depIds.hasOwnProperty(dep.id)) {
            dep.addSub(this);
            this.depIds[dep.id] = dep;
        }
    }
}