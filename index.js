/**
 * verenajs - Modern Vanilla JavaScript Framework
 * No React. No Virtual DOM. Pure Performance.
 *
 * @version 2.0.0
 * @license MIT
 */

// Core Runtime
import verena, {
  VERSION,
  Platform,
  EventBus,
  Store,
  registerComponent,
  getComponent,
  hasComponent,
  listComponents,
  getComponentMeta,
  createElement,
  reactive,
  dom,
  theme,
  injectStyle,
  events,
  store,
  usePlugin,
  componentRegistry
} from './core/core.js';

// Registry
import {
  componentManifest,
  loadComponent,
  preloadComponents,
  getComponentNames,
  getComponentsByCategory,
  getCategories
} from './core/registry.js';

// Router
import Router from './components/vRouter/index.js';

// Core Components - Direct Imports for Zero-Config Usage
import { createButton } from './components/buttons/index.js';
import { createInput } from './components/input/index.js';
import { createCard } from './components/Card/index.js';
import { createModal } from './components/Modal/index.js';
import { createAlert } from './components/alert/index.js';
import { createAvatar } from './components/avatar/index.js';
import { createBadge } from './components/badge/index.js';
import { createBottomSheet } from './components/bottomsheet/index.js';
import { createNavbar } from './components/navbar/index.js';
import { createCheckbox } from './components/checkbox/index.js';
import { createColorPicker } from './components/colorpicker/index.js';
import { createDatePicker } from './components/datepicker/index.js';
import { createDropdown } from './components/dropdown/index.js';
import { createLabel } from './components/label/index.js';
import { createSpinner } from './components/spinner/index.js';
import { createSearchBar } from './components/searchbar/index.js';
import { createSwitch } from './components/switch/index.js';
import { createSidebar } from './components/sidebar/index.js';
import { createTextarea } from './components/textarea/index.js';
import { createRadioButton } from './components/radiobutton/index.js';
import { createProgressBar } from './components/progressbar/index.js';
import { createSlider } from './components/slider/index.js';
import { createTabs } from './components/tabs/index.js';
import { createTooltip } from './components/tooltip/index.js';

// Layout Components
import { createContainer } from './components/Container/index.js';
import { createGrid } from './components/Grid/index.js';
import { createSection } from './components/Section/index.js';
import { createSplitter } from './components/Splitter/index.js';
import { createDrawer } from './components/Drawer/index.js';
import { createCollapsible } from './components/Collapsible/index.js';
import { createHero } from './components/Hero/index.js';
import { createResizable } from './components/Resizable/index.js';
import { createDivider } from './components/Divider/index.js';
import { createSpacer } from './components/Spacer/index.js';
import { createCenter } from './components/Center/index.js';
import { createStack } from './components/Stack/index.js';
import { createWrap } from './components/Wrap/index.js';

// Advanced Form Components
import { createSmartForm } from './components/SmartForm/index.js';
import { createTagInput } from './components/TagInput/index.js';
import { createMultiSelect } from './components/MultiSelect/index.js';
import { createNumberInput } from './components/NumberInput/index.js';
import { createFileUploader } from './components/FileUploader/index.js';
import { createRangeSlider } from './components/RangeSlider/index.js';
import { createMaskInput } from './components/MaskInput/index.js';
import { createPhoneInput } from './components/PhoneInput/index.js';
import { createOtpInput } from './components/otpInput/index.js';

// Button Variants
import { createIconButton } from './components/IconButton/index.js';
import { createButtonGroup } from './components/ButtonGroup/index.js';
import { createFloatingButton } from './components/FloatingButton/index.js';
import { createSplitButton } from './components/SplitButton/index.js';
import { createLoadingButton } from './components/LoadingButton/index.js';

// Display Components
import { createChip } from './components/Chip/index.js';
import { createTag } from './components/Tag/index.js';
import { createPill } from './components/Pill/index.js';
import { createSkeleton } from './components/Skeleton/index.js';
import { createText } from './components/Text/index.js';
import { createHeading } from './components/Heading/index.js';
import { createCode } from './components/Code/index.js';
import { createLink } from './components/Link/index.js';
import { createQuote } from './components/Quote/index.js';
import { createKbd } from './components/Kbd/index.js';
import { createHighlight } from './components/Highlight/index.js';
import { createAvatarGroup } from './components/AvatarGroup/index.js';
import { createStatusDot } from './components/StatusDot/index.js';
import { createCountdownTimer } from './components/CountdownTimer/index.js';

// Data Display
import { createTable } from './components/Table/index.js';
import { createDataTable } from './components/DataTable/index.js';
import { createList } from './components/List/index.js';
import { createVirtualList } from './components/VirtualList/index.js';
import { createTimeline } from './components/Timeline/index.js';
import { createTreeView } from './components/TreeView/index.js';
import { createAccordion } from './components/Accordion/index.js';
import { createStepper } from './components/Stepper/index.js';
import { createStat } from './components/Stat/index.js';
import { createStatGroup } from './components/StatGroup/index.js';

// Navigation
import { createBreadcrumb } from './components/Breadcrumb/index.js';

// Trading Components
import { createOrderBook } from './components/OrderBook/index.js';
import { createTradeHistory } from './components/TradeHistory/index.js';
import { createMarketCard } from './components/MarketCard/index.js';
import { createMarketHeader } from './components/MarketHeader/index.js';
import { createPriceSlider } from './components/PriceSlider/index.js';
import { createOrderForm } from './components/OrderForm/index.js';
import { createPositionCard } from './components/PositionCard/index.js';
import { createOrderRow } from './components/OrderRow/index.js';
import { createMarketChart } from './components/MarketChart/index.js';
import { createMarketMini } from './components/MarketMini/index.js';

// ============================================================================
// NEW PRODUCTION-READY COMPONENT MODULES (v2.0.0)
// ============================================================================

// Charts & Data Visualization
import Charts, {
  createLineChart,
  createBarChart,
  createPieChart,
  createAreaChart,
  createCandlestickChart,
  createGaugeChart,
  createRadarChart,
  createHeatmap,
  createSparkline,
  createProgressRing
} from './components/charts/index.js';

// AI & Chatbot Components
import AI, {
  createChatMessage,
  createChatInput,
  createChatContainer,
  createPromptBuilder,
  createAICompletion,
  createStreamingResponse
} from './components/ai/index.js';

// Communication Components
import Communication, {
  createVideoCall,
  createNotificationCenter,
  createToastContainer,
  createPresenceIndicator,
  createTypingIndicator
} from './components/communication/index.js';

// E-Commerce Components
import Ecommerce, {
  createProductCard,
  createShoppingCart,
  createCheckoutForm,
  createPriceDisplay,
  createQuantitySelector
} from './components/ecommerce/index.js';

// Media Components
import Media, {
  createVideoPlayer,
  createAudioPlayer,
  createImageGallery,
  createImageCropper
} from './components/media/index.js';

// Advanced Form Components
import AdvancedForms, {
  createRichTextEditor,
  createColorPicker as createAdvancedColorPicker,
  createDatePicker as createAdvancedDatePicker,
  createTimePicker,
  createTagsInput,
  createSlider as createAdvancedSlider
} from './components/forms/advanced.js';

// Real-time Components
import Realtime, {
  wsManager,
  createLiveIndicator,
  createConnectionStatus,
  createLiveCounter,
  createLiveClock,
  createActivityFeed,
  createMetricCard,
  createMetricGrid
} from './components/realtime/index.js';

// Production Trading Components
import Trading, {
  createOrderBook as createAdvancedOrderBook,
  createTradeHistory as createAdvancedTradeHistory,
  createPriceTicker,
  createOrderForm as createAdvancedOrderForm,
  createPortfolio,
  createWatchlist
} from './components/trading/index.js';

// Validation System
import Validation, {
  ValidationEngine,
  createFormValidator,
  createReactiveValidator,
  validator,
  PATTERNS,
  MESSAGES
} from './core/validation.js';

// Component namespace for dot-notation access
const components = {
  // Core
  Button: createButton,
  Input: createInput,
  Card: createCard,
  Modal: createModal,
  Alert: createAlert,
  Avatar: createAvatar,
  Badge: createBadge,
  BottomSheet: createBottomSheet,
  Navbar: createNavbar,
  Checkbox: createCheckbox,
  ColorPicker: createColorPicker,
  DatePicker: createDatePicker,
  Dropdown: createDropdown,
  Label: createLabel,
  Spinner: createSpinner,
  SearchBar: createSearchBar,
  Switch: createSwitch,
  Sidebar: createSidebar,
  Textarea: createTextarea,
  RadioButton: createRadioButton,
  ProgressBar: createProgressBar,
  Slider: createSlider,
  Tabs: createTabs,
  Tooltip: createTooltip,

  // Layout
  Container: createContainer,
  Grid: createGrid,
  Section: createSection,
  Splitter: createSplitter,
  Drawer: createDrawer,
  Collapsible: createCollapsible,
  Hero: createHero,
  Resizable: createResizable,
  Divider: createDivider,
  Spacer: createSpacer,
  Center: createCenter,
  Stack: createStack,
  Wrap: createWrap,

  // Advanced Form
  SmartForm: createSmartForm,
  TagInput: createTagInput,
  MultiSelect: createMultiSelect,
  NumberInput: createNumberInput,
  FileUploader: createFileUploader,
  RangeSlider: createRangeSlider,
  MaskInput: createMaskInput,
  PhoneInput: createPhoneInput,
  OtpInput: createOtpInput,

  // Button Variants
  IconButton: createIconButton,
  ButtonGroup: createButtonGroup,
  FloatingButton: createFloatingButton,
  SplitButton: createSplitButton,
  LoadingButton: createLoadingButton,

  // Display
  Chip: createChip,
  Tag: createTag,
  Pill: createPill,
  Skeleton: createSkeleton,
  Text: createText,
  Heading: createHeading,
  Code: createCode,
  Link: createLink,
  Quote: createQuote,
  Kbd: createKbd,
  Highlight: createHighlight,
  AvatarGroup: createAvatarGroup,
  StatusDot: createStatusDot,
  CountdownTimer: createCountdownTimer,

  // Data
  Table: createTable,
  DataTable: createDataTable,
  List: createList,
  VirtualList: createVirtualList,
  Timeline: createTimeline,
  TreeView: createTreeView,
  Accordion: createAccordion,
  Stepper: createStepper,
  Stat: createStat,
  StatGroup: createStatGroup,

  // Navigation
  Breadcrumb: createBreadcrumb,

  // Trading
  OrderBook: createOrderBook,
  TradeHistory: createTradeHistory,
  MarketCard: createMarketCard,
  MarketHeader: createMarketHeader,
  PriceSlider: createPriceSlider,
  OrderForm: createOrderForm,
  PositionCard: createPositionCard,
  OrderRow: createOrderRow,
  MarketChart: createMarketChart,
  MarketMini: createMarketMini,

  // Charts & Data Visualization
  LineChart: createLineChart,
  BarChart: createBarChart,
  PieChart: createPieChart,
  AreaChart: createAreaChart,
  CandlestickChart: createCandlestickChart,
  GaugeChart: createGaugeChart,
  RadarChart: createRadarChart,
  Heatmap: createHeatmap,
  Sparkline: createSparkline,
  ProgressRing: createProgressRing,

  // AI & Chatbot
  ChatMessage: createChatMessage,
  ChatInput: createChatInput,
  ChatContainer: createChatContainer,
  PromptBuilder: createPromptBuilder,
  AICompletion: createAICompletion,
  StreamingResponse: createStreamingResponse,

  // Communication
  VideoCall: createVideoCall,
  NotificationCenter: createNotificationCenter,
  ToastContainer: createToastContainer,
  PresenceIndicator: createPresenceIndicator,
  TypingIndicator: createTypingIndicator,

  // E-Commerce
  ProductCard: createProductCard,
  ShoppingCart: createShoppingCart,
  CheckoutForm: createCheckoutForm,
  PriceDisplay: createPriceDisplay,
  QuantitySelector: createQuantitySelector,

  // Media
  VideoPlayer: createVideoPlayer,
  AudioPlayer: createAudioPlayer,
  ImageGallery: createImageGallery,
  ImageCropper: createImageCropper,

  // Advanced Forms
  RichTextEditor: createRichTextEditor,
  AdvancedColorPicker: createAdvancedColorPicker,
  AdvancedDatePicker: createAdvancedDatePicker,
  TimePicker: createTimePicker,
  TagsInput: createTagsInput,
  AdvancedSlider: createAdvancedSlider,

  // Real-time
  LiveIndicator: createLiveIndicator,
  ConnectionStatus: createConnectionStatus,
  LiveCounter: createLiveCounter,
  LiveClock: createLiveClock,
  ActivityFeed: createActivityFeed,
  MetricCard: createMetricCard,
  MetricGrid: createMetricGrid,

  // Advanced Trading
  AdvancedOrderBook: createAdvancedOrderBook,
  AdvancedTradeHistory: createAdvancedTradeHistory,
  PriceTicker: createPriceTicker,
  AdvancedOrderForm: createAdvancedOrderForm,
  Portfolio: createPortfolio,
  Watchlist: createWatchlist
};

// Module namespaces for organized access
const modules = {
  Charts,
  AI,
  Communication,
  Ecommerce,
  Media,
  AdvancedForms,
  Realtime,
  Trading,
  Validation
};

// verenajs namespace object
const verenajs = {
  VERSION,
  Platform,

  // Core utilities
  createElement,
  dom,
  reactive,
  theme,
  injectStyle,

  // Event system
  events,
  EventBus,

  // State management
  store,
  Store,

  // Component system
  components,
  modules,
  register: registerComponent,
  get: getComponent,
  has: hasComponent,
  list: listComponents,
  meta: getComponentMeta,
  load: loadComponent,
  preload: preloadComponents,

  // Registry utilities
  getComponentNames,
  getComponentsByCategory,
  getCategories,

  // Plugin system
  use: usePlugin,

  // Router
  Router,

  // Validation
  ValidationEngine,
  createFormValidator,
  createReactiveValidator,
  validator,
  PATTERNS,
  MESSAGES,

  // WebSocket Manager
  wsManager
};

// Named exports for tree-shaking
export {
  // Core
  VERSION,
  Platform,
  EventBus,
  Store,
  createElement,
  reactive,
  dom,
  theme,
  injectStyle,
  events,
  store,
  usePlugin,

  // Component system
  registerComponent,
  getComponent,
  hasComponent,
  listComponents,
  getComponentMeta,
  loadComponent,
  preloadComponents,
  getComponentNames,
  getComponentsByCategory,
  getCategories,
  componentManifest,
  components,

  // Router
  Router,

  // Core Components
  createButton,
  createInput,
  createCard,
  createModal,
  createAlert,
  createAvatar,
  createBadge,
  createBottomSheet,
  createNavbar,
  createCheckbox,
  createColorPicker,
  createDatePicker,
  createDropdown,
  createLabel,
  createSpinner,
  createSearchBar,
  createSwitch,
  createSidebar,
  createTextarea,
  createRadioButton,
  createProgressBar,
  createSlider,
  createTabs,
  createTooltip,

  // Layout
  createContainer,
  createGrid,
  createSection,
  createSplitter,
  createDrawer,
  createCollapsible,
  createHero,
  createResizable,
  createDivider,
  createSpacer,
  createCenter,
  createStack,
  createWrap,

  // Advanced Form
  createSmartForm,
  createTagInput,
  createMultiSelect,
  createNumberInput,
  createFileUploader,
  createRangeSlider,
  createMaskInput,
  createPhoneInput,
  createOtpInput,

  // Button Variants
  createIconButton,
  createButtonGroup,
  createFloatingButton,
  createSplitButton,
  createLoadingButton,

  // Display
  createChip,
  createTag,
  createPill,
  createSkeleton,
  createText,
  createHeading,
  createCode,
  createLink,
  createQuote,
  createKbd,
  createHighlight,
  createAvatarGroup,
  createStatusDot,
  createCountdownTimer,

  // Data
  createTable,
  createDataTable,
  createList,
  createVirtualList,
  createTimeline,
  createTreeView,
  createAccordion,
  createStepper,
  createStat,
  createStatGroup,

  // Navigation
  createBreadcrumb,

  // Trading
  createOrderBook,
  createTradeHistory,
  createMarketCard,
  createMarketHeader,
  createPriceSlider,
  createOrderForm,
  createPositionCard,
  createOrderRow,
  createMarketChart,
  createMarketMini,

  // Charts & Data Visualization
  Charts,
  createLineChart,
  createBarChart,
  createPieChart,
  createAreaChart,
  createCandlestickChart,
  createGaugeChart,
  createRadarChart,
  createHeatmap,
  createSparkline,
  createProgressRing,

  // AI & Chatbot
  AI,
  createChatMessage,
  createChatInput,
  createChatContainer,
  createPromptBuilder,
  createAICompletion,
  createStreamingResponse,

  // Communication
  Communication,
  createVideoCall,
  createNotificationCenter,
  createToastContainer,
  createPresenceIndicator,
  createTypingIndicator,

  // E-Commerce
  Ecommerce,
  createProductCard,
  createShoppingCart,
  createCheckoutForm,
  createPriceDisplay,
  createQuantitySelector,

  // Media
  Media,
  createVideoPlayer,
  createAudioPlayer,
  createImageGallery,
  createImageCropper,

  // Advanced Forms
  AdvancedForms,
  createRichTextEditor,
  createAdvancedColorPicker,
  createAdvancedDatePicker,
  createTimePicker,
  createTagsInput,
  createAdvancedSlider,

  // Real-time
  Realtime,
  wsManager,
  createLiveIndicator,
  createConnectionStatus,
  createLiveCounter,
  createLiveClock,
  createActivityFeed,
  createMetricCard,
  createMetricGrid,

  // Advanced Trading
  Trading,
  createAdvancedOrderBook,
  createAdvancedTradeHistory,
  createPriceTicker,
  createAdvancedOrderForm,
  createPortfolio,
  createWatchlist,

  // Validation
  Validation,
  ValidationEngine,
  createFormValidator,
  createReactiveValidator,
  validator,
  PATTERNS,
  MESSAGES,

  // Module namespaces
  modules
};

// Default export
export default verenajs;
