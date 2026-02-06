/**
 * verenajs Component Registry
 * Auto-discovery and registration of all framework components
 */

import { registerComponent } from './core.js';

// Component manifest - maps directory names to their exports
// This is auto-generated and should be kept in sync with components/
const componentManifest = {
  // Layout Components
  'Container': { export: 'createContainer', category: 'layout' },
  'Grid': { export: 'createGrid', category: 'layout' },
  'Masonry': { export: 'createMasonry', category: 'layout' },
  'Section': { export: 'createSection', category: 'layout' },
  'Splitter': { export: 'createSplitter', category: 'layout' },
  'Drawer': { export: 'createDrawer', category: 'layout' },
  'Collapsible': { export: 'createCollapsible', category: 'layout' },
  'Hero': { export: 'createHero', category: 'layout' },
  'Resizable': { export: 'createResizable', category: 'layout' },
  'DockSystem': { export: 'createDockSystem', category: 'layout' },
  'AspectRatio': { export: 'createAspectRatio', category: 'layout' },
  'Center': { export: 'createCenter', category: 'layout' },
  'Stack': { export: 'createStack', category: 'layout' },
  'Wrap': { export: 'createWrap', category: 'layout' },
  'Spacer': { export: 'createSpacer', category: 'layout' },
  'Divider': { export: 'createDivider', category: 'layout' },

  // Form Components
  'input': { export: 'createInput', category: 'form' },
  'buttons': { export: 'createButton', category: 'form' },
  'checkbox': { export: 'createCheckbox', category: 'form' },
  'radiobutton': { export: 'createRadioButton', category: 'form' },
  'textarea': { export: 'createTextarea', category: 'form' },
  'switch': { export: 'createSwitch', category: 'form' },
  'slider': { export: 'createSlider', category: 'form' },
  'colorpicker': { export: 'createColorPicker', category: 'form' },
  'datepicker': { export: 'createDatePicker', category: 'form' },
  'dropdown': { export: 'createDropdown', category: 'form' },
  'searchbar': { export: 'createSearchBar', category: 'form' },
  'SmartForm': { export: 'createSmartForm', category: 'form' },
  'TagInput': { export: 'createTagInput', category: 'form' },
  'MultiSelect': { export: 'createMultiSelect', category: 'form' },
  'NumberInput': { export: 'createNumberInput', category: 'form' },
  'FileUploader': { export: 'createFileUploader', category: 'form' },
  'RangeSlider': { export: 'createRangeSlider', category: 'form' },
  'RichTextEditor': { export: 'createRichTextEditor', category: 'form' },
  'MaskInput': { export: 'createMaskInput', category: 'form' },
  'SchemaForm': { export: 'createSchemaForm', category: 'form' },
  'PhoneInput': { export: 'createPhoneInput', category: 'form' },
  'otpInput': { export: 'createOtpInput', category: 'form' },
  'form': { export: 'createForm', category: 'form' },

  // Button Variants
  'IconButton': { export: 'createIconButton', category: 'buttons' },
  'ButtonGroup': { export: 'createButtonGroup', category: 'buttons' },
  'FloatingButton': { export: 'createFloatingButton', category: 'buttons' },
  'SplitButton': { export: 'createSplitButton', category: 'buttons' },
  'LoadingButton': { export: 'createLoadingButton', category: 'buttons' },

  // Display Components
  'Card': { export: 'createCard', category: 'display' },
  'Modal': { export: 'createModal', category: 'display' },
  'alert': { export: 'createAlert', category: 'display' },
  'avatar': { export: 'createAvatar', category: 'display' },
  'badge': { export: 'createBadge', category: 'display' },
  'tooltip': { export: 'createTooltip', category: 'display' },
  'spinner': { export: 'createSpinner', category: 'display' },
  'progressbar': { export: 'createProgressBar', category: 'display' },
  'label': { export: 'createLabel', category: 'display' },
  'Chip': { export: 'createChip', category: 'display' },
  'Tag': { export: 'createTag', category: 'display' },
  'Pill': { export: 'createPill', category: 'display' },
  'Skeleton': { export: 'createSkeleton', category: 'display' },
  'Text': { export: 'createText', category: 'display' },
  'Heading': { export: 'createHeading', category: 'display' },
  'Code': { export: 'createCode', category: 'display' },
  'Link': { export: 'createLink', category: 'display' },
  'Quote': { export: 'createQuote', category: 'display' },
  'Kbd': { export: 'createKbd', category: 'display' },
  'Highlight': { export: 'createHighlight', category: 'display' },
  'AvatarGroup': { export: 'createAvatarGroup', category: 'display' },
  'StatusDot': { export: 'createStatusDot', category: 'display' },
  'CountdownTimer': { export: 'createCountdownTimer', category: 'display' },
  'profileBox': { export: 'createProfileBox', category: 'display' },
  'priceCard': { export: 'createPriceCard', category: 'display' },
  'glassMorphism': { export: 'createGlassMorphism', category: 'display' },
  'iosLoader': { export: 'createIosLoader', category: 'display' },
  'iosSwitch': { export: 'createIosSwitch', category: 'display' },

  // Navigation Components
  'navbar': { export: 'createNavbar', category: 'navigation' },
  'sidebar': { export: 'createSidebar', category: 'navigation' },
  'tabs': { export: 'createTabs', category: 'navigation' },
  'bottomsheet': { export: 'createBottomSheet', category: 'navigation' },
  'vRouter': { export: 'default', category: 'navigation', isDefault: true },
  'Breadcrumb': { export: 'createBreadcrumb', category: 'navigation' },
  'MultitabSection': { export: 'createMultitabSection', category: 'navigation' },
  'searchFilter': { export: 'createSearchFilter', category: 'navigation' },

  // Data Display
  'Table': { export: 'createTable', category: 'data' },
  'DataTable': { export: 'createDataTable', category: 'data' },
  'List': { export: 'createList', category: 'data' },
  'VirtualList': { export: 'createVirtualList', category: 'data' },
  'Timeline': { export: 'createTimeline', category: 'data' },
  'TreeView': { export: 'createTreeView', category: 'data' },
  'Accordion': { export: 'createAccordion', category: 'data' },
  'Stepper': { export: 'createStepper', category: 'data' },
  'Stat': { export: 'createStat', category: 'data' },
  'StatGroup': { export: 'createStatGroup', category: 'data' },

  // Trading/Finance Components
  'OrderBook': { export: 'createOrderBook', category: 'trading' },
  'TradeHistory': { export: 'createTradeHistory', category: 'trading' },
  'MarketCard': { export: 'createMarketCard', category: 'trading' },
  'MarketHeader': { export: 'createMarketHeader', category: 'trading' },
  'PriceSlider': { export: 'createPriceSlider', category: 'trading' },
  'OrderForm': { export: 'createOrderForm', category: 'trading' },
  'PositionCard': { export: 'createPositionCard', category: 'trading' },
  'OrderRow': { export: 'createOrderRow', category: 'trading' },
  'MarketChart': { export: 'createMarketChart', category: 'trading' },
  'MarketMini': { export: 'createMarketMini', category: 'trading' }
};

// Dynamic component loader
const componentCache = new Map();

async function loadComponent(name) {
  if (componentCache.has(name)) {
    return componentCache.get(name);
  }

  const manifest = componentManifest[name];
  if (!manifest) {
    throw new Error(`Component "${name}" not found in registry`);
  }

  try {
    const module = await import(`../components/${name}/index.js`);
    const factory = manifest.isDefault ? module.default : module[manifest.export];

    if (typeof factory !== 'function') {
      throw new Error(`Component "${name}" does not export a valid factory function`);
    }

    componentCache.set(name, factory);
    registerComponent(name, factory, { category: manifest.category });
    return factory;
  } catch (err) {
    console.error(`Failed to load component "${name}":`, err);
    throw err;
  }
}

// Preload commonly used components
async function preloadComponents(names) {
  return Promise.all(names.map(loadComponent));
}

// Get all component names
function getComponentNames() {
  return Object.keys(componentManifest);
}

// Get components by category
function getComponentsByCategory(category) {
  return Object.entries(componentManifest)
    .filter(([, meta]) => meta.category === category)
    .map(([name]) => name);
}

// Get all categories
function getCategories() {
  return [...new Set(Object.values(componentManifest).map(m => m.category))];
}

export {
  componentManifest,
  loadComponent,
  preloadComponents,
  getComponentNames,
  getComponentsByCategory,
  getCategories
};
