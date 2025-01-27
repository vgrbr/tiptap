(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@tiptap/extension-bubble-menu'), require('react'), require('@tiptap/core'), require('react-dom'), require('@tiptap/extension-floating-menu')) :
  typeof define === 'function' && define.amd ? define(['exports', '@tiptap/extension-bubble-menu', 'react', '@tiptap/core', 'react-dom', '@tiptap/extension-floating-menu'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global["@tiptap/react"] = {}, global.extensionBubbleMenu, global.React, global.core, global.ReactDOM, global.extensionFloatingMenu));
})(this, (function (exports, extensionBubbleMenu, React, core, ReactDOM, extensionFloatingMenu) { 'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var React__default = /*#__PURE__*/_interopDefaultLegacy(React);
  var ReactDOM__default = /*#__PURE__*/_interopDefaultLegacy(ReactDOM);

  const BubbleMenu = (props) => {
      const [element, setElement] = React.useState(null);
      React.useEffect(() => {
          if (!element) {
              return;
          }
          if (props.editor.isDestroyed) {
              return;
          }
          const { pluginKey = 'bubbleMenu', editor, tippyOptions = {}, shouldShow = null, } = props;
          const plugin = extensionBubbleMenu.BubbleMenuPlugin({
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
      return (React__default["default"].createElement("div", { ref: setElement, className: props.className, style: { visibility: 'hidden' } }, props.children));
  };

  class Editor extends core.Editor {
      constructor() {
          super(...arguments);
          this.contentComponent = null;
      }
  }

  const Portals = ({ renderers }) => {
      return (React__default["default"].createElement(React__default["default"].Fragment, null, Array.from(renderers).map(([key, renderer]) => {
          return ReactDOM__default["default"].createPortal(renderer.reactElement, renderer.element, key);
      })));
  };
  class PureEditorContent extends React__default["default"].Component {
      constructor(props) {
          super(props);
          this.editorContentRef = React__default["default"].createRef();
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
          return (React__default["default"].createElement(React__default["default"].Fragment, null,
              React__default["default"].createElement("div", { ref: this.editorContentRef, ...rest }),
              React__default["default"].createElement(Portals, { renderers: this.state.renderers })));
      }
  }
  const EditorContent = React__default["default"].memo(PureEditorContent);

  const FloatingMenu = (props) => {
      const [element, setElement] = React.useState(null);
      React.useEffect(() => {
          if (!element) {
              return;
          }
          if (props.editor.isDestroyed) {
              return;
          }
          const { pluginKey = 'floatingMenu', editor, tippyOptions = {}, shouldShow = null, } = props;
          const plugin = extensionFloatingMenu.FloatingMenuPlugin({
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
      return (React__default["default"].createElement("div", { ref: setElement, className: props.className, style: { visibility: 'hidden' } }, props.children));
  };

  const ReactNodeViewContext = React.createContext({
      onDragStart: undefined,
  });
  const useReactNodeView = () => React.useContext(ReactNodeViewContext);

  const NodeViewContent = props => {
      const Tag = props.as || 'div';
      const { nodeViewContentRef } = useReactNodeView();
      return (React__default["default"].createElement(Tag, { ...props, ref: nodeViewContentRef, "data-node-view-content": "", style: {
              whiteSpace: 'pre-wrap',
              ...props.style,
          } }));
  };

  const NodeViewWrapper = React__default["default"].forwardRef((props, ref) => {
      const { onDragStart } = useReactNodeView();
      const Tag = props.as || 'div';
      return (React__default["default"].createElement(Tag, { ...props, ref: ref, "data-node-view-wrapper": "", onDragStart: onDragStart, style: {
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
          this.reactElement = React__default["default"].createElement(Component, { ...props });
          // queueMicrotask(() => {
          ReactDOM.flushSync(() => {
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
              ReactDOM.flushSync(() => {
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

  class ReactNodeView extends core.NodeView {
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
              return (React__default["default"].createElement(ReactNodeViewContext.Provider, { value: { onDragStart, nodeViewContentRef } },
                  React__default["default"].createElement(Component, { ...componentProps })));
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
      const [, setValue] = React.useState(0);
      return () => setValue(value => value + 1);
  }
  const useEditor = (options = {}, deps = []) => {
      const [editor, setEditor] = React.useState(null);
      const forceUpdate = useForceUpdate();
      React.useEffect(() => {
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

  exports.BubbleMenu = BubbleMenu;
  exports.Editor = Editor;
  exports.EditorContent = EditorContent;
  exports.FloatingMenu = FloatingMenu;
  exports.NodeViewContent = NodeViewContent;
  exports.NodeViewWrapper = NodeViewWrapper;
  exports.PureEditorContent = PureEditorContent;
  exports.ReactNodeViewRenderer = ReactNodeViewRenderer;
  exports.ReactRenderer = ReactRenderer;
  exports.useEditor = useEditor;
  Object.keys(core).forEach(function (k) {
    if (k !== 'default' && !exports.hasOwnProperty(k)) Object.defineProperty(exports, k, {
      enumerable: true,
      get: function () { return core[k]; }
    });
  });

  Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=tiptap-react.umd.js.map
