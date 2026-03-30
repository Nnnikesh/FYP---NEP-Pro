import * as React from 'react'
import { Languages } from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.jsx'

const LanguageContext = React.createContext(undefined)

const translations = {
  en: {
    // Nav
    home: 'Home',
    about: 'About Us',
    designer: '3D Designer',
    marketplace: 'Marketplace',
    help: 'Help',
    admin: 'Admin',
    login: 'Login',
    signup: 'Sign Up',

    // Footer
    quick_links: 'Quick Links',
    services: 'Services',
    contact: 'Contact',
    footer_desc: 'Digitizing traditional event management for Nepal with precision 3D visualization.',
    all_rights_reserved: 'All rights reserved. Built for Nepali traditions.',

    // HomePage Hero
    hero_title: 'Plan Your Perfect Event',
    hero_subtitle: 'Connect with trusted Nepali event vendors and bring your celebration to life',
    get_started: 'Browse Vendors',
    view_marketplace: 'Browse Vendors',
    stat_assets: 'Event Photos',
    stat_vendors: 'Vendors',
    stat_events: 'Events',
    live_3d_preview: 'Real Vendor Photos',
    design_with_precision: 'See before you book',

    // HomePage Features
    features_title: 'Why Choose NEP-Pro?',
    features_subtitle: 'Everything you need to plan authentic Nepali celebrations with confidence',
    feature_1_title: 'Trusted Vendors',
    feature_1_desc: 'Browse verified vendors specialising in traditional Nepali ceremonies',
    feature_2_title: 'Real Event Photos',
    feature_2_desc: 'See actual photos from past events so you know exactly what to expect',
    feature_3_title: 'NPR Budget Planner',
    feature_3_desc: 'Plan your entire event budget in Nepalese Rupees with live estimates',
    feature_4_title: 'Cultural Expertise',
    feature_4_desc: 'Vendors specialised in Newari, Brahmin, Thakuri, and other traditions',

    // HomePage Cultural Section
    cultural_library_title: 'Event Photo Gallery',
    cultural_library_subtitle: 'Browse real photos from traditional Nepali ceremonies',
    mandaps: 'Mandaps',
    pooja_setups: 'Pooja Setups',
    floral_arches: 'Floral Arches',
    stage_decor: 'Stage Decor',

    // HomePage Target Users
    for_event_hosts: 'For Event Hosts',
    for_vendors: 'For Vendors',
    host_benefit_1: 'Browse real photos of past events before booking',
    host_benefit_2: 'Compare vendors by specialisation, location, and price',
    host_benefit_3: 'Plan your budget in NPR with our built-in budget planner',
    host_benefit_4: 'Book trusted vendors for authentic cultural ceremonies',
    vendor_benefit_1: 'Upload event photos to attract the right clients',
    vendor_benefit_2: 'Showcase your cultural specialisation to targeted clients',
    vendor_benefit_3: 'Manage bookings and inquiries from one dashboard',
    vendor_benefit_4: 'Digital presence for small businesses without technical skills',
    start_your_design: 'Browse Vendors',
    join_marketplace: 'Join Marketplace',

    // HomePage CTA
    cta_title: 'Ready to Plan Your Perfect Event?',
    cta_subtitle: 'Join hundreds of families and vendors already using NEP-Pro for perfect cultural celebrations',
    launch_designer: 'Browse Vendors',
    learn_more: 'Learn More',

    // AboutPage
    about_hero_title: 'Digitizing Traditional Event Management',
    about_hero_subtitle: 'NEP-Pro bridges the visualization gap between event hosts and vendors, bringing precision and cultural authenticity to Nepali celebrations',
    our_mission: 'Our Mission',
    mission_para_1: 'Nepal\'s event industry faces a critical "visualization crisis" - families struggle to communicate their vision to vendors, leading to disappointing results and wasted resources.',
    mission_para_2: 'We\'re solving this by providing the first 3D event visualization platform specifically designed for Nepali cultural traditions. Our system captures precise spatial data (X, Y, Z coordinates) to generate technical blueprints that ensure 100% execution accuracy.',
    mission_para_3: 'By digitizing traditional event management, we empower both hosts and vendors to create celebrations that honor Nepal\'s rich cultural heritage with modern precision.',
    visualization_crisis: 'The Visualization Crisis',
    crisis_subtitle: 'Traditional event planning in Nepal faces significant challenges',
    miscommunication: 'Miscommunication',
    budget_overruns: 'Budget Overruns',
    execution_errors: 'Execution Errors',
    miscomm_desc: 'Hosts struggle to convey their vision using static images and verbal descriptions',
    budget_desc: 'Unclear planning leads to last-minute changes and unexpected costs',
    exec_desc: 'Vendors lack precise specifications, resulting in layout and decoration mistakes',
    the_nep_pro_solution: 'The NEP-Pro Solution',
    how_we_solve: 'How We Solve It',
    step_1_title: 'Interactive 3D Visualization',
    step_1_desc: 'Hosts design their event in real-time using Three.js-powered 3D canvas with authentic cultural assets like Mandaps, Pooja setups, and traditional decor',
    step_2_title: 'Coordinate-Based Precision',
    step_2_desc: 'Every placed object records exact X, Y, and Z coordinates in PostgreSQL, creating a technical blueprint that eliminates guesswork',
    step_3_title: 'Automated Technical Documentation',
    step_3_desc: 'System generates detailed blueprints and inventory lists for vendors, ensuring they understand exactly what to build and where to place it',
    step_4_title: 'Real-Time NPR Budgeting',
    step_4_desc: 'Dynamic cost calculation updates as items are added, helping families plan within their budget without surprises',
    who_we_serve: 'Who We Serve',
    who_serve_subtitle: 'Built for the Nepali event ecosystem - from families to vendors',
    event_hosts: 'Event Hosts',
    vendors_label: 'Vendors',
    event_hosts_subtitle: 'Families planning cultural celebrations',
    vendors_subtitle: 'Small businesses and decoration specialists',
    primary_use_cases: 'Primary Use Cases:',
    vendor_types: 'Vendor Types:',
    key_benefits: 'Key Benefits:',
    use_case_1: 'Wedding ceremonies (Vivaha Sanskar)',
    use_case_2: 'Sacred thread ceremonies (Bratabandha)',
    use_case_3: 'Rice feeding ceremonies (Annaprasan)',
    use_case_4: 'Religious festivals and Pujas',
    vendor_type_1: 'Cultural specialists (Newari, Brahmin, Thakuri)',
    vendor_type_2: 'Decoration and floral services',
    vendor_type_3: 'Mandap and stage constructors',
    vendor_type_4: 'Event venues and banquet halls',
    host_key_benefit_1: 'See your vision come to life before the event',
    host_key_benefit_2: 'Avoid costly miscommunication with vendors',
    host_key_benefit_3: 'Plan within budget with real-time cost tracking',
    vendor_key_benefit_1: 'Receive precise specifications with coordinates',
    vendor_key_benefit_2: 'Reduce execution errors and rework costs',
    vendor_key_benefit_3: 'Digital presence without technical skills',
    our_values: 'Our Values',
    values_subtitle: 'Principles that guide everything we build',
    cultural_authenticity: 'Cultural Authenticity',
    precision_engineering: 'Precision Engineering',
    accessibility_first: 'Accessibility First',
    cultural_auth_desc: "Every asset and feature respects and celebrates Nepal's rich cultural heritage",
    precision_desc: 'Technical accuracy through coordinate-based design ensures perfect execution',
    accessibility_desc: 'Bilingual interface and intuitive design make advanced technology accessible to all',
    join_digital_revolution: 'Join the Digital Revolution',
    about_cta_subtitle: 'Be part of the movement transforming how Nepal celebrates its cultural traditions',
    start_designing: 'Start Designing',
    explore_vendors: 'Explore Vendors',

    // MarketplacePage
    marketplace_title: 'Vendor Marketplace',
    marketplace_subtitle: 'Connect with verified vendors specialized in Nepali cultural events',
    search_vendors_placeholder: 'Search vendors by name, service, or specialization...',
    cultural_specialization: 'Cultural Specialization',
    all_vendors: 'All Vendors',
    verified: 'Verified',
    reviews_label: 'reviews',
    services_label: 'Services',
    call: 'Call',
    message: 'Message',
    no_vendors_found: 'No Vendors Found',
    no_vendors_desc: 'Try adjusting your search or filter criteria to find more vendors',
    reset_filters: 'Reset Filters',
    are_you_vendor: 'Are You a Vendor?',
    vendor_cta_subtitle: "Join NEP-Pro's marketplace and receive precise technical blueprints from clients. Showcase your cultural specialization to thousands of event hosts.",
    register_as_vendor: 'Register as Vendor',
    showing: 'Showing',
    of: 'of',
    vendors_text: 'vendors',

    // HelpPage
    help_title: 'Help & Support',
    help_subtitle: 'Find answers to common questions or reach out to our support team',
    search_help_placeholder: 'Search help articles...',
    browse_faqs: 'Browse FAQs',
    video_tutorials: 'Video Tutorials',
    contact_support: 'Contact Support',
    browse_faqs_desc: 'Find quick answers to common questions',
    video_tutorials_desc: 'Watch step-by-step guides',
    contact_support_desc: 'Get help from our team',
    view_all_faqs: 'View All FAQs',
    watch_tutorials: 'Watch Tutorials',
    send_message_btn: 'Send Message',
    popular_tutorials: 'Popular Tutorials',
    read_btn: 'Read',
    faq_title: 'Frequently Asked Questions',
    still_need_help: 'Still Need Help?',
    still_need_help_subtitle: "Can't find what you're looking for? Send us a message and we'll get back to you within 24 hours.",
    name_label: 'Name',
    email_label: 'Email',
    subject_label: 'Subject',
    message_label: 'Message',
    name_placeholder: 'Your full name',
    email_placeholder: 'your.email@example.com',
    subject_placeholder_help: 'What do you need help with?',
    message_placeholder_help: 'Describe your issue or question in detail...',
    send_message: 'Send Message',
    sending: 'Sending...',
    success_message: "Message sent! We'll get back to you within 24 hours.",
    error_message: 'Something went wrong. Please try again.',
    email_us: 'Email Us',
    call_us: 'Call Us',

    // FAQ Categories
    faq_cat_1: 'Getting Started',
    faq_cat_2: 'Using the 3D Designer',
    faq_cat_3: 'Budget Planning',
    faq_cat_4: 'Vendor Marketplace',
    faq_cat_5: 'Technical Issues',

    // Tutorials
    tut_1_title: 'Quick Start Guide',
    tut_1_desc: 'Learn the basics of NEP-Pro in 5 minutes',
    tut_1_dur: '5 min read',
    tut_2_title: 'Creating Your First Mandap Design',
    tut_2_desc: 'Step-by-step tutorial for wedding mandap layouts',
    tut_2_dur: '10 min read',
    tut_3_title: 'Working with Blueprints',
    tut_3_desc: 'Understanding coordinates and sharing with vendors',
    tut_3_dur: '8 min read',
    tut_4_title: 'Budget Optimization Tips',
    tut_4_desc: 'How to balance cost and quality for your event',
    tut_4_dur: '6 min read',
  },

  ne: {
    // Nav
    home: 'गृहपृष्ठ',
    about: 'हाम्रो बारेमा',
    designer: '३डी डिजाइनर',
    marketplace: 'बजार',
    help: 'सहायता',
    admin: 'प्रशासन',
    login: 'लगइन',
    signup: 'साइन अप',

    // Footer
    quick_links: 'द्रुत लिङ्कहरू',
    services: 'सेवाहरू',
    contact: 'सम्पर्क',
    footer_desc: 'सटीक ३डी दृश्यावलोकनसँग नेपालको परम्परागत कार्यक्रम व्यवस्थापनलाई डिजिटाइज गर्दै।',
    all_rights_reserved: 'सर्वाधिकार सुरक्षित। नेपाली परम्पराहरूका लागि निर्मित।',

    // HomePage Hero
    hero_title: 'आफ्नो उत्तम कार्यक्रम योजना गर्नुहोस्',
    hero_subtitle: 'विश्वसनीय नेपाली कार्यक्रम विक्रेताहरूसँग जोडिनुहोस् र आफ्नो उत्सव जीवन्त बनाउनुहोस्',
    get_started: 'विक्रेताहरू हेर्नुहोस्',
    view_marketplace: 'विक्रेताहरू हेर्नुहोस्',
    stat_assets: 'कार्यक्रम फोटोहरू',
    stat_vendors: 'विक्रेताहरू',
    stat_events: 'कार्यक्रमहरू',
    live_3d_preview: 'वास्तविक विक्रेता फोटोहरू',
    design_with_precision: 'बुकिङ अघि हेर्नुहोस्',

    // HomePage Features
    features_title: 'NEP-Pro किन छान्ने?',
    features_subtitle: 'आत्मविश्वासका साथ प्रामाणिक नेपाली उत्सवहरू योजना गर्न आवश्यक सबै कुरा',
    feature_1_title: 'विश्वसनीय विक्रेताहरू',
    feature_1_desc: 'परम्परागत नेपाली समारोहहरूमा विशेषज्ञ प्रमाणित विक्रेताहरू हेर्नुहोस्',
    feature_2_title: 'वास्तविक कार्यक्रम फोटोहरू',
    feature_2_desc: 'पहिलेका कार्यक्रमहरूबाट वास्तविक फोटोहरू हेर्नुहोस् ताकि तपाईंलाई ठ्याक्कै थाहा होस्',
    feature_3_title: 'NPR बजेट योजनाकार',
    feature_3_desc: 'लाइभ अनुमानसँग नेपाली रुपैयाँमा आफ्नो सम्पूर्ण कार्यक्रम बजेट योजना गर्नुहोस्',
    feature_4_title: 'सांस्कृतिक विशेषज्ञता',
    feature_4_desc: 'नेवारी, ब्राह्मण, ठकुरी र अन्य परम्पराहरूमा विशेषज्ञ विक्रेताहरू',

    // HomePage Cultural Section
    cultural_library_title: 'कार्यक्रम फोटो ग्यालेरी',
    cultural_library_subtitle: 'परम्परागत नेपाली समारोहहरूबाट वास्तविक फोटोहरू हेर्नुहोस्',
    mandaps: 'मण्डपहरू',
    pooja_setups: 'पूजा सेटअपहरू',
    floral_arches: 'फूलका आर्चहरू',
    stage_decor: 'स्टेज सजावट',

    // HomePage Target Users
    for_event_hosts: 'कार्यक्रम आयोजकहरूका लागि',
    for_vendors: 'विक्रेताहरूका लागि',
    host_benefit_1: 'बुकिङ अघि विगतका कार्यक्रमहरूका वास्तविक फोटोहरू हेर्नुहोस्',
    host_benefit_2: 'विशेषज्ञता, स्थान र मूल्यद्वारा विक्रेताहरू तुलना गर्नुहोस्',
    host_benefit_3: 'हाम्रो बिल्ट-इन बजेट योजनाकारसँग NPR मा बजेट योजना गर्नुहोस्',
    host_benefit_4: 'प्रामाणिक सांस्कृतिक समारोहका लागि विश्वसनीय विक्रेताहरू बुक गर्नुहोस्',
    vendor_benefit_1: 'सही ग्राहकहरू आकर्षित गर्न कार्यक्रम फोटोहरू अपलोड गर्नुहोस्',
    vendor_benefit_2: 'लक्षित ग्राहकहरूलाई आफ्नो सांस्कृतिक विशेषज्ञता प्रदर्शन गर्नुहोस्',
    vendor_benefit_3: 'एउटै ड्यासबोर्डबाट बुकिङ र सोधपुछहरू व्यवस्थापन गर्नुहोस्',
    vendor_benefit_4: 'प्राविधिक सीप बिना साना व्यवसायहरूका लागि डिजिटल उपस्थिति',
    start_your_design: 'विक्रेताहरू हेर्नुहोस्',
    join_marketplace: 'बजारमा सामेल हुनुहोस्',

    // HomePage CTA
    cta_title: 'आफ्नो उत्तम कार्यक्रम योजना गर्न तयार हुनुहुन्छ?',
    cta_subtitle: 'सही सांस्कृतिक उत्सवहरूका लागि NEP-Pro प्रयोग गरिरहेका सयौं परिवार र विक्रेताहरूमा सामेल हुनुहोस्',
    launch_designer: 'विक्रेताहरू हेर्नुहोस्',
    learn_more: 'थप जान्नुहोस्',

    // AboutPage
    about_hero_title: 'परम्परागत कार्यक्रम व्यवस्थापनलाई डिजिटाइज गर्दै',
    about_hero_subtitle: 'NEP-Pro ले कार्यक्रम आयोजकहरू र विक्रेताहरू बीचको दृश्यावलोकन अन्तरलाई पुल गर्दछ, नेपाली उत्सवहरूमा सटीकता र सांस्कृतिक प्रामाणिकता ल्याउँदै',
    our_mission: 'हाम्रो उद्देश्य',
    mission_para_1: 'नेपालको कार्यक्रम उद्योगले एक महत्वपूर्ण "दृश्यावलोकन संकट" सामना गर्दैछ - परिवारहरूले विक्रेताहरूलाई आफ्नो दृष्टिकोण सञ्चार गर्न संघर्ष गर्छन्, जसले निराशाजनक परिणाम र फोहोर स्रोतहरू निम्त्याउँछ।',
    mission_para_2: 'हामी नेपाली सांस्कृतिक परम्पराहरूका लागि विशेष रूपमा डिजाइन गरिएको पहिलो ३डी कार्यक्रम दृश्यावलोकन प्लेटफर्म प्रदान गरेर यो समाधान गर्दैछौं। हाम्रो प्रणालीले सटीक स्थानिक डेटा (X, Y, Z निर्देशांकहरू) कैद गर्दछ जसले १००% कार्यान्वयन सटीकता सुनिश्चित गर्ने प्राविधिक योजनाहरू उत्पन्न गर्दछ।',
    mission_para_3: 'परम्परागत कार्यक्रम व्यवस्थापनलाई डिजिटाइज गरेर, हामी आयोजकहरू र विक्रेताहरू दुवैलाई नेपालको समृद्ध सांस्कृतिक सम्पदालाई आधुनिक सटीकताका साथ सम्मान गर्ने उत्सवहरू सिर्जना गर्न सशक्त बनाउँछौं।',
    visualization_crisis: 'दृश्यावलोकन संकट',
    crisis_subtitle: 'नेपालमा परम्परागत कार्यक्रम योजनाले महत्वपूर्ण चुनौतीहरू सामना गर्दछ',
    miscommunication: 'गलत सञ्चार',
    budget_overruns: 'बजेट अतिक्रमण',
    execution_errors: 'कार्यान्वयन त्रुटिहरू',
    miscomm_desc: 'आयोजकहरूले स्थिर छविहरू र मौखिक विवरणहरू प्रयोग गरेर आफ्नो दृष्टिकोण व्यक्त गर्न संघर्ष गर्छन्',
    budget_desc: 'अस्पष्ट योजनाले अन्तिम-क्षणका परिवर्तनहरू र अप्रत्याशित लागतहरू निम्त्याउँछ',
    exec_desc: 'विक्रेताहरूसँग सटीक विशिष्टताहरूको अभाव छ, जसले लेआउट र सजावट गल्तीहरू निम्त्याउँछ',
    the_nep_pro_solution: 'NEP-Pro समाधान',
    how_we_solve: 'हामी यसलाई कसरी समाधान गर्छौं',
    step_1_title: 'इन्टर्याक्टिभ ३डी दृश्यावलोकन',
    step_1_desc: 'आयोजकहरूले Three.js-संचालित ३डी क्यानभासमा मण्डप, पूजा सेटअप, र परम्परागत सजावट जस्ता प्रामाणिक सांस्कृतिक सम्पत्तिहरूसँग वास्तविक-समयमा आफ्नो कार्यक्रम डिजाइन गर्छन्',
    step_2_title: 'निर्देशांक-आधारित सटीकता',
    step_2_desc: 'प्रत्येक राखिएको वस्तुले PostgreSQL मा सटीक X, Y, र Z निर्देशांकहरू रेकर्ड गर्दछ, एक प्राविधिक योजना सिर्जना गर्दछ जसले अनुमानलाई हटाउँछ',
    step_3_title: 'स्वचालित प्राविधिक कागजात',
    step_3_desc: 'प्रणालीले विक्रेताहरूका लागि विस्तृत योजनाहरू र सूची सूचीहरू उत्पन्न गर्दछ, उनीहरूलाई के बनाउने र कहाँ राख्ने भनेर ठ्याक्कै बुझ्न सुनिश्चित गर्दछ',
    step_4_title: 'वास्तविक-समय NPR बजेटिङ',
    step_4_desc: 'वस्तुहरू थपिँदा गतिशील लागत गणना अपडेट हुन्छ, परिवारहरूलाई आश्चर्य बिना आफ्नो बजेट भित्र योजना गर्न मद्दत गर्दछ',
    who_we_serve: 'हामी कसलाई सेवा गर्छौं',
    who_serve_subtitle: 'नेपाली कार्यक्रम पारिस्थितिकी तन्त्रका लागि निर्मित - परिवारदेखि विक्रेताहरूसम्म',
    event_hosts: 'कार्यक्रम आयोजकहरू',
    vendors_label: 'विक्रेताहरू',
    event_hosts_subtitle: 'सांस्कृतिक उत्सवहरू योजना गर्ने परिवारहरू',
    vendors_subtitle: 'साना व्यवसायहरू र सजावट विशेषज्ञहरू',
    primary_use_cases: 'प्राथमिक प्रयोग अवस्थाहरू:',
    vendor_types: 'विक्रेता प्रकारहरू:',
    key_benefits: 'मुख्य फाइदाहरू:',
    use_case_1: 'विवाह समारोह (विवाह संस्कार)',
    use_case_2: 'ब्रतबन्ध समारोह',
    use_case_3: 'अन्नप्राशन समारोह',
    use_case_4: 'धार्मिक उत्सव र पूजाहरू',
    vendor_type_1: 'सांस्कृतिक विशेषज्ञहरू (नेवारी, ब्राह्मण, ठकुरी)',
    vendor_type_2: 'सजावट र फूलको सेवाहरू',
    vendor_type_3: 'मण्डप र स्टेज निर्माताहरू',
    vendor_type_4: 'कार्यक्रम स्थल र भोजन हलहरू',
    host_key_benefit_1: 'कार्यक्रम अघि आफ्नो दृष्टिकोण जीवन्त हुँदा हेर्नुहोस्',
    host_key_benefit_2: 'विक्रेताहरूसँग महँगो गलत सञ्चारबाट बच्नुहोस्',
    host_key_benefit_3: 'वास्तविक-समय लागत ट्र्याकिङसँग बजेट भित्र योजना गर्नुहोस्',
    vendor_key_benefit_1: 'निर्देशांकहरूसँग सटीक विशिष्टताहरू प्राप्त गर्नुहोस्',
    vendor_key_benefit_2: 'कार्यान्वयन त्रुटिहरू र पुनः काम लागतहरू घटाउनुहोस्',
    vendor_key_benefit_3: 'प्राविधिक सीप बिना डिजिटल उपस्थिति',
    our_values: 'हाम्रा मूल्यहरू',
    values_subtitle: 'हामी निर्माण गर्ने सबैलाई मार्गदर्शन गर्ने सिद्धान्तहरू',
    cultural_authenticity: 'सांस्कृतिक प्रामाणिकता',
    precision_engineering: 'सटीक इन्जिनियरिङ',
    accessibility_first: 'पहुँचयोग्यता पहिले',
    cultural_auth_desc: 'प्रत्येक सम्पत्ति र सुविधाले नेपालको समृद्ध सांस्कृतिक सम्पदालाई सम्मान र उत्सव मनाउँछ',
    precision_desc: 'निर्देशांक-आधारित डिजाइनको माध्यमबाट प्राविधिक सटीकताले सही कार्यान्वयन सुनिश्चित गर्दछ',
    accessibility_desc: 'द्विभाषी इन्टरफेस र सहज डिजाइनले उन्नत प्रविधिलाई सबैका लागि सुलभ बनाउँछ',
    join_digital_revolution: 'डिजिटल क्रान्तिमा सामेल हुनुहोस्',
    about_cta_subtitle: 'नेपालले आफ्ना सांस्कृतिक परम्पराहरू मनाउने तरिकालाई रूपान्तरण गर्ने आन्दोलनको हिस्सा बन्नुहोस्',
    start_designing: 'डिजाइन सुरु गर्नुहोस्',
    explore_vendors: 'विक्रेताहरू अन्वेषण गर्नुहोस्',

    // MarketplacePage
    marketplace_title: 'विक्रेता बजार',
    marketplace_subtitle: 'नेपाली सांस्कृतिक कार्यक्रमहरूमा विशेषज्ञ प्रमाणित विक्रेताहरूसँग जोडिनुहोस्',
    search_vendors_placeholder: 'नाम, सेवा, वा विशेषज्ञताद्वारा विक्रेताहरू खोज्नुहोस्...',
    cultural_specialization: 'सांस्कृतिक विशेषज्ञता',
    all_vendors: 'सबै विक्रेताहरू',
    verified: 'प्रमाणित',
    reviews_label: 'समीक्षाहरू',
    services_label: 'सेवाहरू',
    call: 'कल गर्नुहोस्',
    message: 'सन्देश',
    no_vendors_found: 'कुनै विक्रेता फेला परेन',
    no_vendors_desc: 'थप विक्रेताहरू फेला पार्न आफ्नो खोज वा फिल्टर मापदण्ड समायोजन गर्नुहोस्',
    reset_filters: 'फिल्टरहरू रिसेट गर्नुहोस्',
    are_you_vendor: 'के तपाईं विक्रेता हुनुहुन्छ?',
    vendor_cta_subtitle: 'NEP-Pro को बजारमा सामेल हुनुहोस् र ग्राहकहरूबाट सटीक प्राविधिक योजनाहरू प्राप्त गर्नुहोस्। हजारौं कार्यक्रम आयोजकहरूलाई आफ्नो सांस्कृतिक विशेषज्ञता प्रदर्शन गर्नुहोस्।',
    register_as_vendor: 'विक्रेताको रूपमा दर्ता गर्नुहोस्',
    showing: 'देखाउँदैछ',
    of: 'मध्ये',
    vendors_text: 'विक्रेताहरू',

    // HelpPage
    help_title: 'सहायता र समर्थन',
    help_subtitle: 'सामान्य प्रश्नहरूको उत्तर फेला पार्नुहोस् वा हाम्रो समर्थन टोलीमा पुग्नुहोस्',
    search_help_placeholder: 'सहायता लेखहरू खोज्नुहोस्...',
    browse_faqs: 'FAQ हेर्नुहोस्',
    video_tutorials: 'भिडियो ट्यूटोरियलहरू',
    contact_support: 'समर्थन सम्पर्क',
    browse_faqs_desc: 'सामान्य प्रश्नहरूको द्रुत उत्तरहरू फेला पार्नुहोस्',
    video_tutorials_desc: 'चरण-दर-चरण गाइडहरू हेर्नुहोस्',
    contact_support_desc: 'हाम्रो टोलीबाट सहायता प्राप्त गर्नुहोस्',
    view_all_faqs: 'सबै FAQ हेर्नुहोस्',
    watch_tutorials: 'ट्यूटोरियलहरू हेर्नुहोस्',
    send_message_btn: 'सन्देश पठाउनुहोस्',
    popular_tutorials: 'लोकप्रिय ट्यूटोरियलहरू',
    read_btn: 'पढ्नुहोस्',
    faq_title: 'बारम्बार सोधिने प्रश्नहरू',
    still_need_help: 'अझै सहायता चाहिन्छ?',
    still_need_help_subtitle: 'के तपाईंले खोज्नुभएको कुरा फेला पार्न सक्नुभएन? हामीलाई सन्देश पठाउनुहोस् र हामी २४ घण्टा भित्र तपाईंलाई जवाफ दिनेछौं।',
    name_label: 'नाम',
    email_label: 'इमेल',
    subject_label: 'विषय',
    message_label: 'सन्देश',
    name_placeholder: 'तपाईंको पूरा नाम',
    email_placeholder: 'tapai.email@example.com',
    subject_placeholder_help: 'तपाईंलाई कस्तो सहायता चाहिन्छ?',
    message_placeholder_help: 'आफ्नो समस्या वा प्रश्न विस्तृत रूपमा वर्णन गर्नुहोस्...',
    send_message: 'सन्देश पठाउनुहोस्',
    sending: 'पठाउँदैछ...',
    success_message: 'सन्देश पठाइयो! हामी २४ घण्टा भित्र तपाईंलाई जवाफ दिनेछौं।',
    error_message: 'केही गलत भयो। कृपया पुनः प्रयास गर्नुहोस्।',
    email_us: 'इमेल गर्नुहोस्',
    call_us: 'कल गर्नुहोस्',

    // FAQ Categories
    faq_cat_1: 'सुरुवात गर्दै',
    faq_cat_2: '३डी डिजाइनर प्रयोग गर्दै',
    faq_cat_3: 'बजेट योजना',
    faq_cat_4: 'विक्रेता बजार',
    faq_cat_5: 'प्राविधिक समस्याहरू',

    // Tutorials
    tut_1_title: 'द्रुत सुरुवात गाइड',
    tut_1_desc: '५ मिनेटमा NEP-Pro को आधारभूत कुराहरू सिक्नुहोस्',
    tut_1_dur: '५ मिनेट पठन',
    tut_2_title: 'आफ्नो पहिलो मण्डप डिजाइन सिर्जना गर्दै',
    tut_2_desc: 'विवाह मण्डप लेआउटका लागि चरण-दर-चरण ट्यूटोरियल',
    tut_2_dur: '१० मिनेट पठन',
    tut_3_title: 'योजनाहरूसँग काम गर्दै',
    tut_3_desc: 'निर्देशांकहरू बुझ्ने र विक्रेताहरूसँग साझेदारी गर्ने',
    tut_3_dur: '८ मिनेट पठन',
    tut_4_title: 'बजेट अनुकूलन सुझावहरू',
    tut_4_desc: 'आफ्नो कार्यक्रमका लागि लागत र गुणस्तर कसरी सन्तुलन गर्ने',
    tut_4_dur: '६ मिनेट पठन',
  },
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = React.useState(
    () => localStorage.getItem('language') || 'en'
  )

  const changeLanguage = (lang) => {
    setLanguage(lang)
    localStorage.setItem('language', lang)
  }

  const t = (key) => translations[language][key] || key

  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = React.useContext(LanguageContext)
  if (!context) throw new Error('useLanguage must be used within LanguageProvider')
  return context
}

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Languages className="h-4 w-4" />
          <span className="sr-only">Toggle language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => setLanguage('en')}
          className={language === 'en' ? 'bg-accent' : ''}
        >
          English
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLanguage('ne')}
          className={language === 'ne' ? 'bg-accent' : ''}
        >
          नेपाली
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
