/**
 * verenajs Extended Component Manifest
 * 1000+ Production-Ready Components
 *
 * @version 2.0.0
 * Categories: 40+ component categories covering every web development need
 */

export const COMPONENT_CATEGORIES = {
  // ============================================
  // CORE UI COMPONENTS (100+)
  // ============================================
  layout: {
    name: 'Layout',
    description: 'Page structure and layout components',
    components: [
      'Container', 'Grid', 'Masonry', 'Section', 'Splitter', 'Drawer', 'Collapsible',
      'Hero', 'Resizable', 'DockSystem', 'AspectRatio', 'Center', 'Stack', 'Wrap',
      'Spacer', 'Divider', 'PageLayout', 'DashboardLayout', 'AppShell', 'Sidebar',
      'HeaderLayout', 'FooterLayout', 'TwoColumn', 'ThreeColumn', 'HolyGrail',
      'StickyHeader', 'StickyFooter', 'ScrollContainer', 'VirtualScroll', 'InfiniteScroll',
      'Parallax', 'SplitView', 'Panel', 'PanelGroup', 'Flex', 'GridLayout', 'AutoLayout',
      'ResponsiveContainer', 'BreakpointProvider', 'MediaQuery', 'AspectRatioBox',
      'FullScreen', 'Overlay', 'Layer', 'ZIndex', 'Portal', 'Teleport', 'Slot',
      'NamedSlot', 'DynamicSlot', 'ConditionalRender', 'LazyRender', 'DeferredRender'
    ]
  },

  form: {
    name: 'Form Controls',
    description: 'Input and form components',
    components: [
      'Input', 'TextInput', 'EmailInput', 'PasswordInput', 'NumberInput', 'PhoneInput',
      'UrlInput', 'SearchInput', 'Textarea', 'RichTextEditor', 'MarkdownEditor',
      'CodeEditor', 'JsonEditor', 'HtmlEditor', 'WysiwygEditor', 'Checkbox', 'Radio',
      'RadioGroup', 'CheckboxGroup', 'Switch', 'Toggle', 'ToggleGroup', 'Slider',
      'RangeSlider', 'DoubleSlider', 'ColorPicker', 'ColorInput', 'GradientPicker',
      'DatePicker', 'TimePicker', 'DateTimePicker', 'DateRangePicker', 'MonthPicker',
      'YearPicker', 'WeekPicker', 'CalendarInput', 'Dropdown', 'Select', 'MultiSelect',
      'Combobox', 'Autocomplete', 'TagInput', 'TokenInput', 'ChipInput', 'MaskInput',
      'CurrencyInput', 'PercentInput', 'CreditCardInput', 'IbanInput', 'OtpInput',
      'PinInput', 'VerificationInput', 'FileInput', 'FileUploader', 'ImageUploader',
      'AvatarUploader', 'DragDropUpload', 'MultiFileUpload', 'SignaturePad',
      'DrawingPad', 'RatingInput', 'StarRating', 'EmojiRating', 'ThumbsRating',
      'NpsRating', 'LikertScale', 'FormBuilder', 'DynamicForm', 'SmartForm',
      'SchemaForm', 'JsonSchemaForm', 'StepForm', 'WizardForm', 'ConditionalForm',
      'RepeaterField', 'ArrayField', 'ObjectField', 'FormSection', 'FormGroup',
      'FormRow', 'FormLabel', 'FormHint', 'FormError', 'FormSuccess', 'FieldWrapper',
      'InputGroup', 'InputAddon', 'InputPrefix', 'InputSuffix', 'ClearButton',
      'PasswordToggle', 'CopyButton', 'PasteButton', 'VoiceInput', 'SpeechToText',
      'Captcha', 'ReCaptcha', 'HCaptcha', 'TurnstileCaptcha', 'MathCaptcha'
    ]
  },

  buttons: {
    name: 'Buttons',
    description: 'Button variants and action triggers',
    components: [
      'Button', 'IconButton', 'TextButton', 'OutlineButton', 'GhostButton',
      'LinkButton', 'PillButton', 'RoundButton', 'SquareButton', 'CircleButton',
      'ButtonGroup', 'SplitButton', 'DropdownButton', 'MenuButton', 'ToggleButton',
      'LoadingButton', 'AsyncButton', 'SubmitButton', 'ResetButton', 'CancelButton',
      'CloseButton', 'BackButton', 'ForwardButton', 'RefreshButton', 'PrintButton',
      'ShareButton', 'DownloadButton', 'UploadButton', 'CopyButton', 'DeleteButton',
      'EditButton', 'SaveButton', 'AddButton', 'RemoveButton', 'ExpandButton',
      'CollapseButton', 'MinimizeButton', 'MaximizeButton', 'FullscreenButton',
      'PlayButton', 'PauseButton', 'StopButton', 'RecordButton', 'MuteButton',
      'VolumeButton', 'SettingsButton', 'HelpButton', 'InfoButton', 'WarningButton',
      'ErrorButton', 'SuccessButton', 'FloatingActionButton', 'SpeedDial',
      'ActionMenu', 'QuickActions', 'ContextActions', 'InlineActions', 'BulkActions',
      'SocialButton', 'LoginButton', 'SignupButton', 'LogoutButton', 'ConnectButton',
      'WalletButton', 'PayButton', 'BuyButton', 'SellButton', 'TradeButton',
      'SubscribeButton', 'FollowButton', 'LikeButton', 'DislikeButton', 'VoteButton',
      'ReactionButton', 'BookmarkButton', 'FavoriteButton', 'HeartButton', 'StarButton'
    ]
  },

  display: {
    name: 'Display',
    description: 'Visual presentation components',
    components: [
      'Text', 'Heading', 'Paragraph', 'Quote', 'Blockquote', 'Code', 'InlineCode',
      'Pre', 'CodeBlock', 'SyntaxHighlighter', 'Markdown', 'Html', 'Link', 'Anchor',
      'Kbd', 'Abbr', 'Mark', 'Highlight', 'Underline', 'Strikethrough', 'Subscript',
      'Superscript', 'Small', 'Strong', 'Em', 'Label', 'Badge', 'Tag', 'Chip', 'Pill',
      'StatusBadge', 'CountBadge', 'NotificationBadge', 'OnlineBadge', 'VerifiedBadge',
      'Avatar', 'AvatarGroup', 'AvatarStack', 'UserAvatar', 'TeamAvatar', 'BotAvatar',
      'StatusDot', 'OnlineIndicator', 'ActivityIndicator', 'PresenceIndicator',
      'Image', 'Picture', 'ResponsiveImage', 'LazyImage', 'ProgressiveImage',
      'BlurImage', 'ZoomImage', 'PanZoomImage', 'ImageGallery', 'Lightbox',
      'Carousel', 'Slider', 'ImageSlider', 'ContentSlider', 'Testimonials',
      'Icon', 'IconSet', 'EmojiIcon', 'FlagIcon', 'BrandIcon', 'AnimatedIcon',
      'Skeleton', 'SkeletonText', 'SkeletonAvatar', 'SkeletonCard', 'SkeletonTable',
      'Placeholder', 'EmptyState', 'NoData', 'NoResults', 'ErrorState', 'LoadingState',
      'SuccessState', 'Illustration', 'HeroImage', 'BackgroundImage', 'Pattern',
      'Gradient', 'Noise', 'Blur', 'Glassmorphism', 'Neumorphism', 'CardStack',
      'CountdownTimer', 'Stopwatch', 'Timer', 'Clock', 'AnalogClock', 'DigitalClock',
      'WorldClock', 'Timezone', 'RelativeTime', 'TimeAgo', 'DateDisplay', 'Calendar',
      'EventCalendar', 'BookingCalendar', 'AvailabilityCalendar', 'ScheduleView',
      'WeekView', 'MonthView', 'YearView', 'AgendaView', 'GanttView', 'KanbanBoard',
      'Qrcode', 'Barcode', 'DataMatrix', 'Pdf417', 'QrScanner', 'BarcodeScanner'
    ]
  },

  feedback: {
    name: 'Feedback',
    description: 'User feedback and notification components',
    components: [
      'Alert', 'AlertDialog', 'ConfirmDialog', 'PromptDialog', 'InfoAlert',
      'SuccessAlert', 'WarningAlert', 'ErrorAlert', 'Toast', 'Toaster', 'Notification',
      'NotificationCenter', 'NotificationStack', 'NotificationBanner', 'Snackbar',
      'Message', 'FlashMessage', 'StatusMessage', 'InlineMessage', 'SystemMessage',
      'Modal', 'Dialog', 'ModalDialog', 'BottomSheet', 'ActionSheet', 'Drawer',
      'SlideOver', 'Popover', 'Tooltip', 'HoverCard', 'InfoTip', 'HelpTip',
      'ContextMenu', 'RightClickMenu', 'DropdownMenu', 'CommandPalette', 'Spotlight',
      'SearchPalette', 'QuickSwitcher', 'Omnibar', 'Progress', 'ProgressBar',
      'CircularProgress', 'LinearProgress', 'StepProgress', 'SegmentedProgress',
      'GradientProgress', 'AnimatedProgress', 'IndeterminateProgress', 'BufferProgress',
      'Spinner', 'LoadingSpinner', 'DotSpinner', 'PulseSpinner', 'RingSpinner',
      'GridSpinner', 'BarsSpinner', 'WaveSpinner', 'BounceSpinner', 'FlipSpinner',
      'OrbitSpinner', 'RippleSpinner', 'LoadingOverlay', 'LoadingMask', 'Shimmer',
      'Pulse', 'Wave', 'Breathe', 'Typing', 'TypingIndicator', 'ThinkingIndicator',
      'ProcessingIndicator', 'SyncIndicator', 'UploadProgress', 'DownloadProgress',
      'InstallProgress', 'UpdateProgress', 'MigrationProgress', 'BuildProgress'
    ]
  },

  navigation: {
    name: 'Navigation',
    description: 'Navigation and wayfinding components',
    components: [
      'Navbar', 'TopNav', 'BottomNav', 'SideNav', 'MobileNav', 'DesktopNav',
      'ResponsiveNav', 'MegaMenu', 'DropdownNav', 'FlyoutMenu', 'Breadcrumb',
      'BreadcrumbItem', 'BreadcrumbSeparator', 'Pagination', 'PageNumbers',
      'PageSizeSelector', 'InfinitePagination', 'CursorPagination', 'LoadMore',
      'Tabs', 'TabList', 'TabPanel', 'TabContent', 'VerticalTabs', 'PillTabs',
      'UnderlineTabs', 'IconTabs', 'ScrollTabs', 'StickyTabs', 'Stepper', 'Steps',
      'StepIndicator', 'ProgressSteps', 'VerticalStepper', 'TimelineStepper',
      'Wizard', 'WizardSteps', 'MultiStepForm', 'OnboardingFlow', 'TutorialSteps',
      'Menu', 'MenuItem', 'MenuGroup', 'MenuDivider', 'SubMenu', 'NestedMenu',
      'TreeMenu', 'AccordionMenu', 'CommandMenu', 'KeyboardNav', 'ArrowNav',
      'Skip', 'SkipLink', 'SkipNav', 'JumpTo', 'AnchorLink', 'SmoothScroll',
      'ScrollSpy', 'TableOfContents', 'PageOutline', 'SectionNav', 'InPageNav',
      'BackToTop', 'ScrollToTop', 'FloatingNav', 'DockNav', 'RailNav', 'AppBar',
      'ToolBar', 'ActionBar', 'StatusBar', 'FooterNav', 'SiteMap', 'QuickLinks',
      'RecentItems', 'Favorites', 'Bookmarks', 'History', 'NavigationHistory'
    ]
  },

  data: {
    name: 'Data Display',
    description: 'Data presentation and visualization components',
    components: [
      'Table', 'DataTable', 'DataGrid', 'VirtualTable', 'TreeTable', 'PivotTable',
      'EditableTable', 'SortableTable', 'FilterableTable', 'ResizableTable',
      'FixedHeaderTable', 'StickyColumn', 'ExpandableRow', 'SelectableRow',
      'DraggableRow', 'ColumnChooser', 'ColumnGrouping', 'RowGrouping', 'Aggregation',
      'List', 'VirtualList', 'InfiniteList', 'TreeList', 'NestedList', 'OrderedList',
      'UnorderedList', 'DescriptionList', 'DefinitionList', 'ActionList', 'CheckList',
      'RadioList', 'MediaList', 'AvatarList', 'ContactList', 'FileList', 'FolderList',
      'Timeline', 'VerticalTimeline', 'HorizontalTimeline', 'ActivityTimeline',
      'ChangelogTimeline', 'EventTimeline', 'ProcessTimeline', 'MilestoneTimeline',
      'TreeView', 'FileTree', 'FolderTree', 'CategoryTree', 'OrgChart', 'MindMap',
      'Accordion', 'AccordionItem', 'AccordionPanel', 'NestedAccordion', 'FaqAccordion',
      'Stat', 'StatCard', 'StatGroup', 'Metric', 'KPI', 'ScoreCard', 'Dashboard',
      'DashboardWidget', 'WidgetGrid', 'WidgetPanel', 'InfoCard', 'SummaryCard',
      'ComparisonCard', 'TrendCard', 'SparklineCard', 'HeatmapCard', 'MapCard',
      'Json', 'JsonViewer', 'JsonTree', 'JsonEditor', 'XmlViewer', 'YamlViewer',
      'LogViewer', 'DiffViewer', 'CodeDiff', 'TextDiff', 'SideBySideDiff'
    ]
  },

  // ============================================
  // CHARTS & VISUALIZATION (100+)
  // ============================================
  charts: {
    name: 'Charts',
    description: 'Data visualization charts',
    components: [
      'LineChart', 'AreaChart', 'BarChart', 'ColumnChart', 'PieChart', 'DoughnutChart',
      'RadarChart', 'PolarChart', 'ScatterChart', 'BubbleChart', 'CandlestickChart',
      'OhlcChart', 'HeikinAshiChart', 'RenkoChart', 'KagiChart', 'PointFigureChart',
      'WaterfallChart', 'FunnelChart', 'PyramidChart', 'GaugeChart', 'MeterChart',
      'SpeedometerChart', 'ThermometerChart', 'BulletChart', 'SparkLine', 'SparkBar',
      'SparkArea', 'MicroChart', 'MiniChart', 'InlineChart', 'Heatmap', 'TreeMap',
      'Sunburst', 'Sankey', 'Chord', 'Network', 'ForceGraph', 'DagGraph', 'FlowChart',
      'SankeyDiagram', 'ParallelCoordinates', 'ViolinPlot', 'BoxPlot', 'Histogram',
      'DensityPlot', 'ContourPlot', 'SurfacePlot', 'MapChart', 'GeoMap', 'Choropleth',
      'BubbleMap', 'FlowMap', 'HexbinMap', 'DotMap', 'ClusterMap', 'HeatmapLayer',
      'ComboChart', 'DualAxisChart', 'OverlayChart', 'StackedChart', 'GroupedChart',
      'NormalizedChart', 'PercentChart', 'StreamGraph', 'RidgeLine', 'JoyPlot',
      'RadialBar', 'CircularBar', 'ProgressRing', 'ActivityRing', 'MultiRing',
      'Timeline', 'GanttChart', 'ScheduleChart', 'RangeChart', 'IntervalChart',
      'RealtimeChart', 'StreamingChart', 'LiveChart', 'TickerChart', 'PriceChart',
      'DepthChart', 'VolumeChart', 'MomentumChart', 'TechnicalChart', 'FinancialChart',
      'Chart3D', 'Surface3D', 'Scatter3D', 'Bar3D', 'Globe3D', 'Terrain3D'
    ]
  },

  // ============================================
  // FINANCIAL & TRADING (100+)
  // ============================================
  trading: {
    name: 'Trading',
    description: 'Financial and trading components',
    components: [
      'OrderBook', 'OrderBookDepth', 'OrderBookHeatmap', 'LevelTwoBook', 'MarketDepth',
      'TradeHistory', 'TradeList', 'TradeStream', 'RecentTrades', 'MyTrades',
      'MarketCard', 'AssetCard', 'CryptoCard', 'StockCard', 'ForexCard', 'FuturesCard',
      'OptionsCard', 'DerivativesCard', 'MarketHeader', 'TickerHeader', 'PriceHeader',
      'PriceSlider', 'PriceInput', 'AmountInput', 'TotalInput', 'LeverageSlider',
      'OrderForm', 'BuyForm', 'SellForm', 'LimitOrder', 'MarketOrder', 'StopOrder',
      'StopLimitOrder', 'TrailingStopOrder', 'OcoOrder', 'TwapOrder', 'IcebergOrder',
      'PositionCard', 'OpenPosition', 'PnlCard', 'MarginCard', 'LiquidationPrice',
      'OrderRow', 'OpenOrder', 'OrderHistory', 'OrderStatus', 'OrderCancel',
      'MarketChart', 'TradingChart', 'AdvancedChart', 'TechnicalAnalysis',
      'ChartIndicator', 'MovingAverage', 'Bollinger', 'Macd', 'Rsi', 'Stochastic',
      'Volume', 'VolumeProfile', 'Vwap', 'Fibonacci', 'TrendLine', 'SupportResistance',
      'MarketMini', 'MiniTicker', 'PriceTicker', 'MarketTicker', 'SpotTicker',
      'Watchlist', 'WatchlistItem', 'MarketList', 'AssetList', 'PortfolioList',
      'Portfolio', 'PortfolioSummary', 'PortfolioChart', 'PortfolioAllocation',
      'AssetAllocation', 'SectorAllocation', 'RiskMetrics', 'PerformanceMetrics',
      'BalanceCard', 'EquityCard', 'MarginLevel', 'FreeMargin', 'UsedMargin',
      'FundingRate', 'FundingHistory', 'FundingTimer', 'NextFunding', 'MarkPrice',
      'IndexPrice', 'SpotPrice', 'FuturesPrice', 'SpreadCard', 'BasisCard',
      'LiquidationMap', 'OpenInterest', 'LongShortRatio', 'TakerBuySellRatio',
      'MarketSentiment', 'FearGreedIndex', 'TrendIndicator', 'MomentumIndicator',
      'AlertPanel', 'PriceAlert', 'VolumeAlert', 'ChangeAlert', 'BreakoutAlert',
      'NewsCard', 'MarketNews', 'EconomicCalendar', 'EarningsCalendar', 'IpoCalendar',
      'Leaderboard', 'TopTraders', 'CopyTrading', 'SocialTrading', 'SignalProvider',
      'TradingBot', 'BotConfig', 'BotStatus', 'BotPnl', 'GridBot', 'DcaBot', 'ArbitrageBot'
    ]
  },

  // ============================================
  // REAL-TIME & LIVE DATA (50+)
  // ============================================
  realtime: {
    name: 'Real-time',
    description: 'Live data and streaming components',
    components: [
      'LiveFeed', 'ActivityFeed', 'SocialFeed', 'NewsFeed', 'NotificationFeed',
      'EventStream', 'LogStream', 'DataStream', 'MessageStream', 'ChatStream',
      'LiveCounter', 'ViewerCount', 'OnlineCount', 'ActiveUsers', 'LiveVisitors',
      'LivePrice', 'LiveTicker', 'LiveQuote', 'LiveChart', 'LiveMap', 'LiveTable',
      'RealtimeSync', 'SyncStatus', 'ConnectionStatus', 'LatencyIndicator',
      'WebSocketStatus', 'SseStatus', 'PollStatus', 'HeartbeatIndicator',
      'LiveSearch', 'InstantSearch', 'TypeaheadSearch', 'FuzzySearch', 'SemanticSearch',
      'CollaborativeEdit', 'LiveCursor', 'PresenceCursor', 'MultiplayerCursor',
      'LiveSelection', 'SharedSelection', 'CollaborativeCanvas', 'Whiteboard',
      'VoiceChat', 'VideoChat', 'ScreenShare', 'RemoteDesktop', 'LivePreview',
      'HotReload', 'LiveReload', 'InstantPreview', 'PreviewFrame', 'Sandbox'
    ]
  },

  // ============================================
  // MEDIA & CONTENT (80+)
  // ============================================
  media: {
    name: 'Media',
    description: 'Media playback and content components',
    components: [
      'VideoPlayer', 'AudioPlayer', 'MediaPlayer', 'Html5Video', 'Html5Audio',
      'YoutubeEmbed', 'VimeoEmbed', 'TwitchEmbed', 'SpotifyEmbed', 'SoundcloudEmbed',
      'Playlist', 'VideoPlaylist', 'AudioPlaylist', 'MediaGallery', 'VideoGallery',
      'ImageGallery', 'PhotoGallery', 'Portfolio', 'Masonry', 'Pinterest', 'Justified',
      'Filmstrip', 'Thumbnail', 'ThumbnailGrid', 'ThumbnailSlider', 'CoverFlow',
      'Lightbox', 'PhotoViewer', 'ImageViewer', 'MediaViewer', 'FullscreenViewer',
      'Zoom', 'PanZoom', 'Pinch', 'MagnifyingGlass', 'Compare', 'BeforeAfter',
      'ImageCompare', 'SliderCompare', 'SplitCompare', 'OverlayCompare',
      'Crop', 'ImageCrop', 'AspectCrop', 'CircleCrop', 'FreeCrop', 'CropPreview',
      'Filter', 'ImageFilter', 'ColorFilter', 'BlendMode', 'Adjustment',
      'Transform', 'Rotate', 'Flip', 'Scale', 'Skew', 'Perspective',
      'Annotation', 'ImageAnnotation', 'VideoAnnotation', 'Hotspot', 'Marker',
      'Caption', 'Subtitle', 'ClosedCaption', 'Transcript', 'Lyrics',
      'Waveform', 'AudioWaveform', 'Spectrum', 'Visualizer', 'Equalizer',
      'Recorder', 'AudioRecorder', 'VideoRecorder', 'ScreenRecorder', 'WebcamCapture',
      'Editor', 'ImageEditor', 'VideoEditor', 'AudioEditor', 'PhotoEditor',
      'Pdf', 'PdfViewer', 'PdfThumbnail', 'DocumentViewer', 'OfficeViewer', 'SpreadsheetViewer',
      'Embed', 'IframeEmbed', 'OEmbed', 'RichEmbed', 'CardEmbed', 'PreviewCard'
    ]
  },

  // ============================================
  // COMMUNICATION (60+)
  // ============================================
  communication: {
    name: 'Communication',
    description: 'Chat, messaging, and social components',
    components: [
      'Chat', 'ChatWindow', 'ChatBubble', 'ChatMessage', 'ChatInput', 'ChatSend',
      'ChatHistory', 'ChatRoom', 'ChannelList', 'DirectMessage', 'GroupChat',
      'ThreadedChat', 'ReplyThread', 'Reactions', 'EmojiReactions', 'MessageReactions',
      'Mentions', 'AtMention', 'HashTag', 'LinkPreview', 'UrlPreview', 'MetaCard',
      'TypingIndicator', 'ReadReceipts', 'DeliveryStatus', 'OnlineStatus', 'LastSeen',
      'UserPresence', 'PresenceList', 'ActiveNow', 'RecentlyActive', 'AwayStatus',
      'Comment', 'CommentBox', 'CommentThread', 'CommentList', 'NestedComments',
      'Reply', 'ReplyBox', 'QuotedReply', 'ForwardedMessage', 'SharedMessage',
      'Poll', 'PollCreator', 'PollVote', 'PollResults', 'Survey', 'SurveyBuilder',
      'Announcement', 'Banner', 'SystemBanner', 'MarqueeText', 'Ticker', 'NewsTicker',
      'Email', 'EmailComposer', 'EmailPreview', 'EmailTemplate', 'Newsletter',
      'Sms', 'SmsComposer', 'SmsPreview', 'PhoneCall', 'CallScreen', 'Dialer',
      'VideoCall', 'VideoConference', 'MeetingRoom', 'Lobby', 'WaitingRoom',
      'Notification', 'Push', 'InApp', 'Desktop', 'Mobile', 'WebPush', 'ServiceWorker'
    ]
  },

  // ============================================
  // E-COMMERCE & PAYMENTS (80+)
  // ============================================
  commerce: {
    name: 'E-Commerce',
    description: 'Shopping and payment components',
    components: [
      'ProductCard', 'ProductGrid', 'ProductList', 'ProductDetail', 'ProductGallery',
      'ProductImage', 'ProductTitle', 'ProductPrice', 'ProductDescription', 'ProductSpecs',
      'ProductVariant', 'VariantSelector', 'ColorSelector', 'SizeSelector', 'QuantitySelector',
      'AddToCart', 'BuyNow', 'Wishlist', 'WishlistButton', 'CompareButton', 'ShareProduct',
      'Cart', 'CartDrawer', 'CartModal', 'CartSummary', 'CartItem', 'CartQuantity',
      'Checkout', 'CheckoutForm', 'CheckoutSteps', 'CheckoutSummary', 'OrderSummary',
      'ShippingForm', 'ShippingMethod', 'ShippingRate', 'DeliveryDate', 'PickupLocation',
      'BillingForm', 'BillingAddress', 'TaxCalculator', 'Discount', 'CouponInput',
      'PromoCode', 'GiftCard', 'LoyaltyPoints', 'RewardsBalance', 'CashbackBadge',
      'Payment', 'PaymentForm', 'PaymentMethod', 'CreditCard', 'DebitCard', 'BankTransfer',
      'DigitalWallet', 'ApplePay', 'GooglePay', 'PayPal', 'Stripe', 'Square', 'Klarna',
      'Affirm', 'Afterpay', 'BuyNowPayLater', 'Installments', 'Subscription',
      'Invoice', 'InvoiceTemplate', 'InvoiceItem', 'Receipt', 'ReceiptTemplate',
      'Order', 'OrderTracking', 'OrderStatus', 'OrderTimeline', 'ShipmentTracking',
      'Return', 'ReturnRequest', 'RefundStatus', 'ExchangeForm', 'RmaForm',
      'Review', 'ReviewForm', 'ReviewList', 'ReviewSummary', 'RatingBreakdown',
      'Question', 'QuestionForm', 'QuestionList', 'AnswerForm', 'QnA',
      'Category', 'CategoryNav', 'CategoryTree', 'FilterPanel', 'PriceFilter',
      'BrandFilter', 'RatingFilter', 'StockFilter', 'SortDropdown', 'ViewToggle',
      'Search', 'ProductSearch', 'SearchResults', 'SearchFilters', 'SearchSuggestions',
      'Inventory', 'StockBadge', 'LowStockAlert', 'OutOfStock', 'PreOrder', 'BackOrder'
    ]
  },

  // ============================================
  // AUTHENTICATION & USER MANAGEMENT (50+)
  // ============================================
  auth: {
    name: 'Authentication',
    description: 'Login, signup, and user management',
    components: [
      'Login', 'LoginForm', 'LoginCard', 'LoginPage', 'EmailLogin', 'PhoneLogin',
      'SocialLogin', 'OAuthLogin', 'SamlLogin', 'LdapLogin', 'SsoLogin',
      'Signup', 'SignupForm', 'SignupCard', 'SignupPage', 'SignupWizard',
      'ForgotPassword', 'ResetPassword', 'ChangePassword', 'PasswordStrength',
      'TwoFactor', 'TwoFactorSetup', 'TwoFactorVerify', 'Totp', 'Sms2fa', 'Email2fa',
      'Passkey', 'PasskeySetup', 'BiometricLogin', 'FaceId', 'TouchId', 'Fingerprint',
      'MagicLink', 'PasswordlessLogin', 'OtpLogin', 'QrLogin', 'DeviceLink',
      'SessionManager', 'ActiveSessions', 'SessionCard', 'DeviceCard', 'RevokeSession',
      'Profile', 'ProfileCard', 'ProfileHeader', 'ProfileForm', 'ProfileSettings',
      'Avatar', 'AvatarUpload', 'AvatarEdit', 'ProfilePicture', 'CoverImage',
      'Account', 'AccountSettings', 'AccountSecurity', 'AccountDeletion', 'DataExport',
      'Verification', 'EmailVerification', 'PhoneVerification', 'IdentityVerification',
      'Kyc', 'KycForm', 'KycStatus', 'KycDocument', 'DocumentUpload', 'IdCard',
      'Permissions', 'PermissionList', 'RoleManager', 'AccessControl', 'FeatureFlag'
    ]
  },

  // ============================================
  // MAPS & LOCATION (40+)
  // ============================================
  maps: {
    name: 'Maps',
    description: 'Mapping and location components',
    components: [
      'Map', 'InteractiveMap', 'StaticMap', 'MapView', 'StreetView', 'SatelliteView',
      'MapMarker', 'CustomMarker', 'MarkerCluster', 'AnimatedMarker', 'PulseMarker',
      'Polygon', 'Polyline', 'Circle', 'Rectangle', 'GeoJson', 'KmlLayer',
      'Heatmap', 'HeatLayer', 'DensityMap', 'FlowMap', 'RouteMap', 'DirectionsMap',
      'Geolocation', 'CurrentLocation', 'LocationTracker', 'Geofence', 'ProximityAlert',
      'AddressInput', 'AddressAutocomplete', 'PlacePicker', 'PlaceSearch', 'Geocoder',
      'Distance', 'DistanceMatrix', 'TravelTime', 'EtaCalculator', 'RouteOptimizer',
      'LocationPicker', 'AreaPicker', 'RegionSelector', 'CountrySelector', 'CitySelector',
      'StoreLocator', 'BranchFinder', 'NearbyPlaces', 'PointsOfInterest', 'Directions',
      'Indoor', 'FloorPlan', 'BuildingMap', 'VenueMap', 'SeatingChart', 'OfficeMap'
    ]
  },

  // ============================================
  // AI & MACHINE LEARNING (40+)
  // ============================================
  ai: {
    name: 'AI Components',
    description: 'AI-powered and ML components',
    components: [
      'AiChat', 'ChatBot', 'AiAssistant', 'VirtualAgent', 'Copilot', 'AiSuggestion',
      'AutoComplete', 'SmartComplete', 'AiSearch', 'SemanticSearch', 'NaturalLanguage',
      'Sentiment', 'SentimentBadge', 'SentimentChart', 'EmotionDetector', 'MoodIndicator',
      'Translation', 'AutoTranslate', 'LanguageSelector', 'TranslationToggle',
      'Transcription', 'SpeechToText', 'VoiceInput', 'VoiceCommand', 'VoiceAssistant',
      'TextToSpeech', 'NaturalVoice', 'VoiceSelector', 'ReadAloud', 'Narrator',
      'ImageRecognition', 'ObjectDetection', 'FaceDetection', 'TextExtraction', 'Ocr',
      'Classification', 'Categorization', 'TagSuggestion', 'AutoTag', 'SmartLabels',
      'Recommendation', 'SuggestedItems', 'RelatedContent', 'PersonalizedFeed',
      'Prediction', 'Forecast', 'TrendPrediction', 'AnomalyDetection', 'AlertPrediction',
      'Summarization', 'AutoSummary', 'KeyPoints', 'Headlines', 'AbstractGenerator',
      'ContentGeneration', 'AiWriter', 'CopyGenerator', 'HeadlineGenerator', 'DescriptionGenerator'
    ]
  },

  // ============================================
  // DEVELOPER & TOOLS (60+)
  // ============================================
  developer: {
    name: 'Developer',
    description: 'Development and debugging tools',
    components: [
      'Console', 'DebugConsole', 'LogViewer', 'LogStream', 'LogFilter', 'LogSearch',
      'Inspector', 'ElementInspector', 'DomTree', 'StyleInspector', 'ComputedStyles',
      'NetworkPanel', 'RequestList', 'RequestDetail', 'ResponseViewer', 'HeadersView',
      'PerformancePanel', 'Profiler', 'FlameGraph', 'CallStack', 'MemoryUsage',
      'StorageViewer', 'LocalStorage', 'SessionStorage', 'CookieViewer', 'IndexedDb',
      'Terminal', 'CommandLine', 'Shell', 'Repl', 'InteractiveConsole', 'CodeRunner',
      'Debugger', 'Breakpoint', 'StepThrough', 'WatchList', 'CallStackView',
      'ApiTester', 'RestClient', 'GraphqlPlayground', 'WebsocketTester', 'SocketClient',
      'JsonFormatter', 'XmlFormatter', 'YamlFormatter', 'SqlFormatter', 'CodeFormatter',
      'Base64', 'Base64Encoder', 'Base64Decoder', 'UrlEncoder', 'HtmlEncoder',
      'Hash', 'HashGenerator', 'Md5', 'Sha256', 'Uuid', 'UuidGenerator',
      'Diff', 'DiffViewer', 'MergeConflict', 'ThreeWayMerge', 'Patch',
      'Regex', 'RegexTester', 'RegexBuilder', 'PatternMatcher', 'FindReplace',
      'Color', 'ColorConverter', 'ColorPalette', 'GradientGenerator', 'ContrastChecker',
      'Timestamp', 'TimestampConverter', 'DateFormatter', 'TimezoneConverter', 'Cron',
      'Lorem', 'LoremIpsum', 'FakeData', 'MockData', 'DataGenerator', 'SchemaGenerator'
    ]
  },

  // ============================================
  // ADMIN & DASHBOARD (50+)
  // ============================================
  admin: {
    name: 'Admin',
    description: 'Admin panel and dashboard components',
    components: [
      'AdminLayout', 'AdminSidebar', 'AdminHeader', 'AdminFooter', 'AdminNav',
      'Dashboard', 'DashboardGrid', 'DashboardWidget', 'WidgetContainer', 'WidgetHeader',
      'StatWidget', 'ChartWidget', 'TableWidget', 'ListWidget', 'MapWidget',
      'UserManagement', 'UserList', 'UserCard', 'UserForm', 'UserProfile',
      'RoleManagement', 'RoleList', 'RoleForm', 'PermissionMatrix', 'AccessLevel',
      'ContentManager', 'PageList', 'PageEditor', 'BlockEditor', 'MediaLibrary',
      'Settings', 'SettingsPage', 'SettingsGroup', 'SettingsForm', 'ConfigEditor',
      'Analytics', 'AnalyticsDashboard', 'TrafficChart', 'UserChart', 'ConversionChart',
      'Reports', 'ReportBuilder', 'ReportViewer', 'ExportReport', 'ScheduledReport',
      'Audit', 'AuditLog', 'AuditTrail', 'ActivityLog', 'ChangeHistory',
      'System', 'SystemStatus', 'HealthCheck', 'ServiceStatus', 'ErrorLog',
      'Jobs', 'JobQueue', 'BackgroundJobs', 'ScheduledJobs', 'CronJobs',
      'Cache', 'CacheManager', 'CacheStats', 'CacheClear', 'RedisPanel'
    ]
  },

  // ============================================
  // API & INTEGRATION (40+)
  // ============================================
  api: {
    name: 'API & Integration',
    description: 'API management and integration components',
    components: [
      'ApiManager', 'ApiEndpoint', 'ApiRoute', 'ApiMethod', 'ApiDocs',
      'ApiKey', 'ApiKeyManager', 'KeyGenerator', 'KeyRotation', 'RateLimiter',
      'Webhook', 'WebhookManager', 'WebhookEndpoint', 'WebhookLog', 'WebhookTest',
      'OAuth', 'OAuthConfig', 'OAuthCallback', 'TokenManager', 'RefreshToken',
      'GraphQL', 'GraphiQL', 'SchemaViewer', 'QueryBuilder', 'MutationBuilder',
      'Rest', 'RestBuilder', 'EndpointTester', 'CurlGenerator', 'PostmanExport',
      'Swagger', 'SwaggerUI', 'OpenApi', 'ApiSpec', 'ApiMock',
      'Integration', 'IntegrationCard', 'ConnectedApps', 'AppStore', 'Marketplace',
      'Zapier', 'ZapierTrigger', 'ZapierAction', 'Ifttt', 'Automate',
      'Import', 'DataImport', 'CsvImport', 'ExcelImport', 'JsonImport',
      'Export', 'DataExport', 'CsvExport', 'ExcelExport', 'PdfExport'
    ]
  },

  // ============================================
  // DOCKER & DEVOPS (30+)
  // ============================================
  devops: {
    name: 'DevOps',
    description: 'Docker and deployment components',
    components: [
      'DockerManager', 'ContainerList', 'ContainerCard', 'ContainerLogs', 'ContainerStats',
      'ImageList', 'ImageCard', 'ImageBuilder', 'Dockerfile', 'DockerCompose',
      'NetworkList', 'NetworkCard', 'PortMapping', 'VolumeList', 'VolumeCard',
      'K8sCluster', 'PodList', 'PodCard', 'DeploymentList', 'ServiceList',
      'Pipeline', 'CiCd', 'BuildStatus', 'DeploymentStatus', 'PipelineView',
      'Environment', 'EnvManager', 'EnvVariable', 'SecretManager', 'ConfigMap',
      'Monitoring', 'MetricsDashboard', 'AlertManager', 'IncidentList', 'OnCall',
      'Logs', 'LogAggregator', 'LogSearch', 'LogAlert', 'LogDashboard',
      'Scaling', 'AutoScaler', 'LoadBalancer', 'ServiceMesh', 'Gateway'
    ]
  },

  // ============================================
  // SOCIAL & SHARING (30+)
  // ============================================
  social: {
    name: 'Social',
    description: 'Social media and sharing components',
    components: [
      'ShareButton', 'ShareMenu', 'ShareModal', 'CopyLink', 'QrShare',
      'SocialIcons', 'TwitterShare', 'FacebookShare', 'LinkedinShare', 'WhatsappShare',
      'EmailShare', 'SmsShare', 'TelegramShare', 'RedditShare', 'PinterestShare',
      'Follow', 'FollowButton', 'FollowerCount', 'FollowingList', 'FollowerList',
      'Like', 'LikeButton', 'LikeCount', 'HeartAnimation', 'ThumbsUp',
      'Comment', 'CommentForm', 'CommentList', 'CommentThread', 'Reply',
      'Embed', 'EmbedCode', 'EmbedPreview', 'IframeEmbed', 'OEmbedCard',
      'Social', 'SocialCard', 'SocialLink', 'SocialProof', 'Testimonial'
    ]
  },

  // ============================================
  // MOBILE SPECIFIC (40+)
  // ============================================
  mobile: {
    name: 'Mobile',
    description: 'Mobile-specific components',
    components: [
      'MobileNav', 'BottomNavigation', 'TabBar', 'FloatingTabBar', 'SafeArea',
      'PullToRefresh', 'InfiniteScroll', 'SwipeCard', 'SwipeAction', 'SwipeToDelete',
      'Gesture', 'Pinch', 'Pan', 'Swipe', 'LongPress', 'DoubleTap', 'ForcePress',
      'Haptic', 'Vibration', 'HapticFeedback', 'TactileFeedback',
      'NativeList', 'NativeCell', 'NativeHeader', 'NativeFooter', 'NativeModal',
      'ActionSheet', 'BottomSheet', 'ModalSheet', 'SheetHandle', 'SheetBackdrop',
      'StatusBar', 'NavigationBar', 'ToolbarIos', 'ToolbarAndroid', 'AppBar',
      'Toast', 'Snackbar', 'MobileAlert', 'MobileDialog', 'MobileTooltip',
      'Picker', 'DatePicker', 'TimePicker', 'WheelPicker', 'OptionPicker',
      'Camera', 'CameraView', 'PhotoCapture', 'VideoCapture', 'QrScanner',
      'Biometric', 'FaceId', 'TouchId', 'Fingerprint', 'PinPad'
    ]
  },

  // ============================================
  // ANIMATION & EFFECTS (40+)
  // ============================================
  animation: {
    name: 'Animation',
    description: 'Animation and visual effects',
    components: [
      'Animate', 'AnimateOnScroll', 'AnimateOnView', 'AnimateOnHover', 'AnimateOnClick',
      'Transition', 'FadeTransition', 'SlideTransition', 'ScaleTransition', 'RotateTransition',
      'Stagger', 'StaggerList', 'StaggerGrid', 'Cascade', 'Sequential',
      'Spring', 'SpringAnimation', 'Physics', 'Bounce', 'Elastic',
      'Morph', 'ShapeMorph', 'PathMorph', 'ColorMorph', 'NumberMorph',
      'Parallax', 'ParallaxLayer', 'ParallaxScroll', 'DepthEffect', 'Perspective',
      'Particles', 'ParticleSystem', 'Confetti', 'Snow', 'Rain', 'Fireworks',
      'Reveal', 'TextReveal', 'ImageReveal', 'MaskReveal', 'ClipReveal',
      'Flip', 'FlipCard', 'Flip3d', 'CubeRotate', 'CarouselFlip',
      'Lottie', 'LottiePlayer', 'JsonAnimation', 'RiveAnimation', 'SvgAnimation',
      'Cursor', 'CustomCursor', 'CursorFollow', 'CursorTrail', 'MagneticCursor',
      'Scroll', 'SmoothScroll', 'ScrollTrigger', 'ScrollProgress', 'ScrollSnap'
    ]
  },

  // ============================================
  // 3D & WEBGL (30+)
  // ============================================
  threeDimensions: {
    name: '3D & WebGL',
    description: '3D rendering and WebGL components',
    components: [
      'Canvas3d', 'Scene', 'Camera', 'Light', 'AmbientLight', 'DirectionalLight',
      'Mesh', 'Geometry', 'Material', 'Texture', 'Environment', 'Skybox',
      'Model', 'GltfLoader', 'ObjLoader', 'FbxLoader', 'AnimatedModel',
      'OrbitControls', 'FlyControls', 'PointerLockControls', 'TransformControls',
      'Postprocessing', 'Bloom', 'DepthOfField', 'MotionBlur', 'ChromaticAberration',
      'Particles3d', 'PointCloud', 'Instancing', 'InstancedMesh',
      'Ar', 'ArView', 'ArMarker', 'ArPlacement', 'ArMeasure',
      'Vr', 'VrView', 'VrController', 'VrTeleport', 'VrInteraction',
      'Spline', 'SplineViewer', 'SplineScene', 'Interactive3d'
    ]
  },

  // ============================================
  // ACCESSIBILITY (20+)
  // ============================================
  accessibility: {
    name: 'Accessibility',
    description: 'Accessibility-focused components',
    components: [
      'SkipLink', 'SkipToContent', 'FocusTrap', 'FocusRing', 'FocusVisible',
      'ScreenReader', 'SrOnly', 'AriaLive', 'Announcer', 'LiveRegion',
      'HighContrast', 'DarkMode', 'ReducedMotion', 'LargeText', 'Dyslexia',
      'KeyboardNav', 'ArrowNav', 'TabNav', 'RovinTabIndex', 'FocusManager',
      'ColorBlind', 'Deuteranopia', 'Protanopia', 'Tritanopia', 'Monochrome'
    ]
  },

  // ============================================
  // PRINT & EXPORT (20+)
  // ============================================
  print: {
    name: 'Print & Export',
    description: 'Printing and document export',
    components: [
      'PrintView', 'PrintLayout', 'PrintHeader', 'PrintFooter', 'PageBreak',
      'PdfGenerator', 'PdfTemplate', 'PdfPage', 'PdfTable', 'PdfChart',
      'ExcelExport', 'CsvExport', 'JsonExport', 'XmlExport', 'WordExport',
      'PrintPreview', 'PrintSettings', 'PageSetup', 'MarginControl', 'Orientation'
    ]
  },

  // ============================================
  // INTERNATIONALIZATION (15+)
  // ============================================
  i18n: {
    name: 'Internationalization',
    description: 'Multi-language and locale components',
    components: [
      'LanguageSwitcher', 'LocaleProvider', 'TranslationProvider', 'T', 'Trans',
      'DateFormat', 'NumberFormat', 'CurrencyFormat', 'RelativeTime', 'Plural',
      'Rtl', 'RtlProvider', 'DirectionProvider', 'BidiText', 'MirrorLayout'
    ]
  },

  // ============================================
  // GAMIFICATION (25+)
  // ============================================
  gamification: {
    name: 'Gamification',
    description: 'Game-like engagement components',
    components: [
      'Achievement', 'AchievementBadge', 'AchievementUnlock', 'Trophy', 'Medal',
      'Leaderboard', 'Ranking', 'ScoreBoard', 'TopPlayers', 'HighScore',
      'Progress', 'XpBar', 'LevelUp', 'SkillTree', 'ProgressPath',
      'Points', 'PointsDisplay', 'PointsEarned', 'Streak', 'DailyStreak',
      'Challenge', 'Quest', 'Mission', 'Goal', 'Milestone',
      'Reward', 'RewardCard', 'SpinWheel', 'ScratchCard', 'LootBox'
    ]
  },

  // ============================================
  // SCHEDULING & CALENDAR (25+)
  // ============================================
  scheduling: {
    name: 'Scheduling',
    description: 'Calendar and scheduling components',
    components: [
      'Calendar', 'BigCalendar', 'MiniCalendar', 'InlineCalendar', 'RangeCalendar',
      'DayView', 'WeekView', 'MonthView', 'YearView', 'AgendaView',
      'Event', 'EventCard', 'EventList', 'EventForm', 'EventPopover',
      'Scheduler', 'ResourceScheduler', 'TimelineScheduler', 'GanttScheduler',
      'Booking', 'BookingCalendar', 'AvailabilityPicker', 'TimeSlotPicker',
      'Reminder', 'ReminderForm', 'ReminderList', 'Alarm', 'Notification',
      'Recurring', 'RecurrenceRule', 'RecurrencePicker', 'Rrule', 'ICalendar'
    ]
  }
};

// Generate full component manifest from categories
export function generateComponentManifest() {
  const manifest = {};

  Object.entries(COMPONENT_CATEGORIES).forEach(([categoryKey, category]) => {
    category.components.forEach(componentName => {
      const exportName = `create${componentName.replace(/[^a-zA-Z0-9]/g, '')}`;
      manifest[componentName] = {
        export: exportName,
        category: categoryKey,
        description: `${componentName} component`,
        version: '2.0.0'
      };
    });
  });

  return manifest;
}

// Get total component count
export function getComponentCount() {
  return Object.values(COMPONENT_CATEGORIES).reduce(
    (sum, cat) => sum + cat.components.length, 0
  );
}

// Export manifest
export const extendedComponentManifest = generateComponentManifest();

// Console log total count
console.log(`verenajs: ${getComponentCount()} components available`);
