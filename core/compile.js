/* compile 编译模块：
* 指令解析器，对每个元素节点的指令进行解析，根据指令模板替换数据，并绑定相应的更新函数
*/
function Compile(el, vm) {
    this.$vm = vm;
    this.$el = this.isElementNode(el) ? el: document.querySelector(el);

    if (this.$el) {
        this.$fragment = this.nodeFragment(this.$el);
        this.init();
        this.$el.appendChild(this.$fragment);
    }
}

Compile.prototype = {
    constructor: Compile,
    nodeFragment(el) {
        let fragment = document.createDocumentFragment();
        let child;

        while (child = el.firstChild) {
            fragment.appendChild(child);
        }
        return fragment;
    },
    init() {
        this.compileElement(this.$fragment);
    },
    compileElement(node) {
        let childNodes = node.childNodes;
        let self = this;

        [].slice.call(childNodes).forEach(node => {
            let text = node.textContent;
            let reg = /\{\{(.*)\}\}/;

            if (self.isElementNode(node)) {
                self.compileDirective(node);
            } else if (self.isTextNode(node) && reg.test(text)) {
                self.compileText(node, RegExp.$1.trim());
            }

            if (node.childNodes && node.childNodes.length) {
                self.compileElement(node);
            }
        });
    },
    compileDirective(node) {
        let attrs = node.attributes;
        let self = this;

        [].slice.call(attrs).forEach(attr => {
            let attrName = attr.name;
            if (self.isDirective(attrName)) {
                let val = attrName.value;
                let sub = attrName.substring(2);

                // 事件指令
                if (self.isEventDirective(sub)) {
                    compileUtils.eventHandler(node, self.$vm, val, sub);
                } else {
                    // 普通指令
                    compileUtils[sub] && self.compileUtils[sub](node, self.$vm, val);
                }
            }
            node.removeAttribute(attrName);
        });
    },
    compileText(node, str) {
        compileUtils.text(node, this.$vm, str);
    },
    isDirective(attr) {
        return attr.indexOf('v-') === 0;
    },
    isEventDirective(attr) {
        return attr.indexOf('on') === 0;
    },
    isElementNode(node) {
        return node.nodeType === 1;
    },
    isTextNode(node) {
        return node.nodeType === 3;
    }
};

let compileUtils = {
    text(node, vm, str) {
        this.bind(node, vm, str, 'text');
    },
    html(node, vm, str) {
        this.bind(node, vm, str, 'html');
    },
    model(node, vm, str) {
        this.bind(node, vm, str, 'model');
        let self = this;
        let val = this._getVMVal(str, vm);

        node.addEventListener('input', function(e) {
            let newVal = e.target.value;

            if (val === newVal) return;
            self._setVMVal(str, vm, newVal);
            val = newVal;
        });
    },
    bind(node, vm, str, dir) {
        let updaterFn = updater[`${dir}Updater`];
        updaterFn && updaterFn(node, this._getVMVal(str, vm));

        new Watcher(vm, str, function(val, oldVal) {
            updaterFn && updaterFn(node, val, oldVal);
        })
    },
    eventHandler(node, vm, val, dir) {
        let eventType = dir.split(':')[1];
        let fn = vm.$option.methods && vm.$option.methods[val];

        if (eventType && fn) {
            node.addEventListener(eventType, fn.bind(vm), false);
        }
    },
    _getVMVal(str, data) {
        let arr = str.split('.');
        let val = data;

        arr.forEach(k => {
            val = val[k];
        });
        return val;
    },
    _setVMVal(str, data, val) {
        let arr = str.split('.');
        let tempVal = data;
        
        arr.forEach((k, i) => {
            if (i < arr.length-1) {
                tempVal = tempVal[k];
            } else {
                tempVal[k] = val;
            }
        });
    }
};

let updater = {
    textUpdater(node, val) {
        node.textContent = typeof val === 'undefined' ? '' : val;
    },
    htmlUpdater(node, val) {
        node.innerHTML = typeof val === 'undefined' ? '' : val;
    },
    modelUpdater(node, val) {
        node.value = typeof val === 'undefined' ? '' : val;
    }
};