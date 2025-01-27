import { BubbleMenuPlugin } from '@tiptap/extension-bubble-menu';
import React, { useState, useEffect, createContext, useContext } from 'react';
import { Editor as Editor$1, NodeView } from '@tiptap/core';
export * from '@tiptap/core';
import ReactDOM, { flushSync } from 'react-dom';
import { FloatingMenuPlugin } from '@tiptap/extension-floating-menu';

const BubbleMenu = (props) => {
    const [element, setElement] = useState(null);
    useEffect(() => {
        if (!element) {
            return;
        }
        if (props.editor.isDestroyed) {
            return;
        }
        const { pluginKey = 'bubbleMenu', editor, tippyOptions = {}, shouldShow = null, } = props;
        const plugin = BubbleMenuPlugin({
            pluginKey,
            editor,
            element,
            tippyOptions,
            shouldShow,
        });
        editor.registerPlugin(plugin);
        return () => editor.unregisterPlugin(pluginKey);
    }, [
        props.editor,
        element,
    ]);
    return (React.createElement("div", { ref: setElement, className: props.className, style: { visibility: 'hidden' } }, props.children));
};

class Editor extends Editor$1 {
    constructor() {
        super(...arguments);
        this.contentComponent = null;
    }
}

const Portals = ({ renderers }) => {
    return (React.createElement(React.Fragment, null, Array.from(renderers).map(([key, renderer]) => {
        return ReactDOM.createPortal(renderer.reactElement, renderer.element, key);
    })));
};
class PureEditorContent extends React.Component {
    constructor(props) {
        super(props);
        this.editorContentRef = React.createRef();
        this.state = {
            renderers: new Map(),
        };
    }
    componentDidMount() {
        this.init();
    }
    componentDidUpdate() {
        this.init();
    }
    init() {
        const { editor } = this.props;
        if (editor && editor.options.element) {
            if (editor.contentComponent) {
                return;
            }
            const element = this.editorContentRef.current;
            element.append(...editor.options.element.childNodes);
            editor.setOptions({
                element,
            });
            editor.contentComponent = this;
            editor.createNodeViews();
        }
    }
    componentWillUnmount() {
        const { editor } = this.props;
        if (!editor) {
            return;
        }
        if (!editor.isDestroyed) {
            editor.view.setProps({
                nodeViews: {},
            });
        }
        editor.contentComponent = null;
        if (!editor.options.element.firstChild) {
            return;
        }
        const newElement = document.createElement('div');
        newElement.append(...editor.options.element.childNodes);
        editor.setOptions({
            element: newElement,
        });
    }
    render() {
        const { editor, ...rest } = this.props;
        return (React.createElement(React.Fragment, null,
            React.createElement("div", { ref: this.editorContentRef, ...rest }),
            React.createElement(Portals, { renderers: this.state.renderers })));
    }
}
const EditorContent = React.memo(PureEditorContent);

const FloatingMenu = (props) => {
    const [element, setElement] = useState(null);
    useEffect(() => {
        if (!element) {
            return;
        }
        if (props.editor.isDestroyed) {
            return;
        }
        const { pluginKey = 'floatingMenu', editor, tippyOptions = {}, shouldShow = null, } = props;
        const plugin = FloatingMenuPlugin({
            pluginKey,
            editor,
            element,
            tippyOptions,
            shouldShow,
        });
        editor.registerPlugin(plugin);
        return () => editor.unregisterPlugin(pluginKey);
    }, [
        props.editor,
        element,
    ]);
    return (React.createElement("div", { ref: setElement, className: props.className, style: { visibility: 'hidden' } }, props.children));
};

const ReactNodeViewContext = createContext({
    onDragStart: undefined,
});
const useReactNodeView = () => useContext(ReactNodeViewContext);

const NodeViewContent = props => {
    const Tag = props.as || 'div';
    const { nodeViewContentRef } = useReactNodeView();
    return (React.createElement(Tag, { ...props, ref: nodeViewContentRef, "data-node-view-content": "", style: {
            whiteSpace: 'pre-wrap',
            ...props.style,
        } }));
};

const NodeViewWrapper = React.forwardRef((props, ref) => {
    const { onDragStart } = useReactNodeView();
    const Tag = props.as || 'div';
    return (React.createElement(Tag, { ...props, ref: ref, "data-node-view-wrapper": "", onDragStart: onDragStart, style: {
            whiteSpace: 'normal',
            ...props.style,
        } }));
});

function isClassComponent(Component) {
    return !!(typeof Component === "function" &&
        Component.prototype &&
        Component.prototype.isReactComponent);
}
function isForwardRefComponent(Component) {
    var _a;
    return !!(typeof Component === "object" && ((_a = Component.$$typeof) === null || _a === void 0 ? void 0 : _a.toString()) === "Symbol(react.forward_ref)");
}
class ReactRenderer {
    constructor(component, { editor, props = {}, as = "div", className = "" }) {
        this.ref = null;
        this.id = Math.floor(Math.random() * 0xffffffff).toString();
        this.component = component;
        this.editor = editor;
        this.props = props;
        this.element = document.createElement(as);
        this.element.classList.add("react-renderer");
        if (className) {
            this.element.classList.add(...className.split(" "));
        }
        this.render();
    }
    render() {
        const Component = this.component;
        const props = this.props;
        if (isClassComponent(Component) || isForwardRefComponent(Component)) {
            props.ref = (ref) => {
                this.ref = ref;
            };
        }
        this.reactElement = React.createElement(Component, { ...props });
        // queueMicrotask(() => {
        flushSync(() => {
            var _a;
            if ((_a = this.editor) === null || _a === void 0 ? void 0 : _a.contentComponent) {
                this.editor.contentComponent.setState({
                    renderers: this.editor.contentComponent.state.renderers.set(this.id, this),
                });
            }
        });
        // });
    }
    updateProps(props = {}) {
        this.props = {
            ...this.props,
            ...props,
        };
        this.render();
    }
    destroy() {
        queueMicrotask(() => {
            flushSync(() => {
                var _a;
                if ((_a = this.editor) === null || _a === void 0 ? void 0 : _a.contentComponent) {
                    const { renderers } = this.editor.contentComponent.state;
                    renderers.delete(this.id);
                    this.editor.contentComponent.setState({
                        renderers,
                    });
                }
            });
        });
    }
}

class ReactNodeView extends NodeView {
    mount() {
        const props = {
            editor: this.editor,
            node: this.node,
            decorations: this.decorations,
            selected: false,
            extension: this.extension,
            getPos: () => this.getPos(),
            updateAttributes: (attributes = {}) => this.updateAttributes(attributes),
            deleteNode: () => this.deleteNode(),
        };
        if (!this.component.displayName) {
            const capitalizeFirstChar = (string) => {
                return string.charAt(0).toUpperCase() + string.substring(1);
            };
            this.component.displayName = capitalizeFirstChar(this.extension.name);
        }
        const ReactNodeViewProvider = componentProps => {
            const Component = this.component;
            const onDragStart = this.onDragStart.bind(this);
            const nodeViewContentRef = element => {
                if (element && this.contentDOMElement && element.firstChild !== this.contentDOMElement) {
                    element.appendChild(this.contentDOMElement);
                }
            };
            return (React.createElement(ReactNodeViewContext.Provider, { value: { onDragStart, nodeViewContentRef } },
                React.createElement(Component, { ...componentProps })));
        };
        ReactNodeViewProvider.displayName = 'ReactNodeView';
        this.contentDOMElement = this.node.isLeaf
            ? null
            : document.createElement(this.node.isInline ? 'span' : 'div');
        if (this.contentDOMElement) {
            // For some reason the whiteSpace prop is not inherited properly in Chrome and Safari
            // With this fix it seems to work fine
            // See: https://github.com/ueberdosis/tiptap/issues/1197
            this.contentDOMElement.style.whiteSpace = 'inherit';
        }
        let as = this.node.isInline ? 'span' : 'div';
        if (this.options.as) {
            as = this.options.as;
        }
        const { className = '' } = this.options;
        this.renderer = new ReactRenderer(ReactNodeViewProvider, {
            editor: this.editor,
            props,
            as,
            className: `node-${this.node.type.name} ${className}`.trim(),
        });
    }
    get dom() {
        var _a;
        if (this.renderer.element.firstElementChild
            && !((_a = this.renderer.element.firstElementChild) === null || _a === void 0 ? void 0 : _a.hasAttribute('data-node-view-wrapper'))) {
            throw Error('Please use the NodeViewWrapper component for your node view.');
        }
        return this.renderer.element;
    }
    get contentDOM() {
        if (this.node.isLeaf) {
            return null;
        }
        return this.contentDOMElement;
    }
    update(node, decorations) {
        const updateProps = (props) => {
            this.renderer.updateProps(props);
        };
        if (node.type !== this.node.type) {
            return false;
        }
        if (typeof this.options.update === 'function') {
            const oldNode = this.node;
            const oldDecorations = this.decorations;
            this.node = node;
            this.decorations = decorations;
            return this.options.update({
                oldNode,
                oldDecorations,
                newNode: node,
                newDecorations: decorations,
                updateProps: () => updateProps({ node, decorations }),
            });
        }
        if (node === this.node && this.decorations === decorations) {
            return true;
        }
        this.node = node;
        this.decorations = decorations;
        updateProps({ node, decorations });
        return true;
    }
    selectNode() {
        this.renderer.updateProps({
            selected: true,
        });
    }
    deselectNode() {
        this.renderer.updateProps({
            selected: false,
        });
    }
    destroy() {
        this.renderer.destroy();
        this.contentDOMElement = null;
    }
}
function ReactNodeViewRenderer(component, options) {
    return (props) => {
        // try to get the parent component
        // this is important for vue devtools to show the component hierarchy correctly
        // maybe it’s `undefined` because <editor-content> isn’t rendered yet
        if (!props.editor.contentComponent) {
            return {};
        }
        return new ReactNodeView(component, props, options);
    };
}

function useForceUpdate() {
    const [, setValue] = useState(0);
    return () => setValue(value => value + 1);
}
const useEditor = (options = {}, deps = []) => {
    const [editor, setEditor] = useState(null);
    const forceUpdate = useForceUpdate();
    useEffect(() => {
        let isMounted = true;
        const instance = new Editor(options);
        setEditor(instance);
        instance.on('transaction', () => {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    if (isMounted) {
                        forceUpdate();
                    }
                });
            });
        });
        return () => {
            instance.destroy();
            isMounted = false;
        };
    }, deps);
    return editor;
};

export { BubbleMenu, Editor, EditorContent, FloatingMenu, NodeViewContent, NodeViewWrapper, PureEditorContent, ReactNodeViewRenderer, ReactRenderer, useEditor };
//# sourceMappingURL=tiptap-react.esm.js.map
