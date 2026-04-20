/**
 * Forms Builder — Portal Internationalization
 *
 * Simple translation system for the public portal.
 * Supports RTL/LTR languages. Add new locales by extending TRANSLATIONS.
 */

// =============================================================================
// Translation Keys
// =============================================================================

export interface PortalTranslations {
	// Login page
	"login.title": string;
	"login.description": string;
	"login.emailLabel": string;
	"login.emailPlaceholder": string;
	"login.submit": string;
	"login.sending": string;
	"login.success": string;
	"login.successDescription": string;
	"login.error": string;
	"login.invalidEmail": string;

	// Token expired
	"token.expired": string;
	"token.expiredDescription": string;
	"token.resending": string;
	"token.resent": string;

	// Portal dashboard
	"portal.title": string;
	"portal.mySubmissions": string;
	"portal.search": string;
	"portal.searchPlaceholder": string;
	"portal.noSubmissions": string;
	"portal.noSubmissionsDescription": string;
	"portal.noResults": string;
	"portal.logout": string;
	"portal.statusAll": string;
	"portal.statusOpen": string;
	"portal.statusRead": string;
	"portal.statusClosed": string;

	// Submission detail
	"detail.trackingCode": string;
	"detail.submittedAt": string;
	"detail.status": string;
	"detail.answers": string;
	"detail.conversation": string;
	"detail.noReplies": string;
	"detail.replyPlaceholder": string;
	"detail.sendReply": string;
	"detail.sending": string;
	"detail.back": string;
	"detail.adminReply": string;
	"detail.yourMessage": string;
	"detail.initialSubmission": string;

	// Status labels
	"status.open": string;
	"status.read": string;
	"status.closed": string;

	// Common
	"common.loading": string;
	"common.error": string;
	"common.retry": string;
	"common.poweredBy": string;

	// Shorthand aliases used by components
	adminLabel: string;
	youLabel: string;
}

// =============================================================================
// RTL Languages
// =============================================================================

const RTL_LOCALES = new Set(["fa", "ar", "he", "ur", "ps", "ku", "sd", "yi"]);

export function isRtlLocale(locale: string): boolean {
	const base = locale.split("-")[0]?.toLowerCase() ?? "";
	return RTL_LOCALES.has(base);
}

export function getDirection(locale: string): "rtl" | "ltr" {
	return isRtlLocale(locale) ? "rtl" : "ltr";
}

// =============================================================================
// Translation Dictionaries
// =============================================================================

const en: PortalTranslations = {
	"login.title": "Support Portal",
	"login.description": "Enter your email to access your submissions and responses.",
	"login.emailLabel": "Email Address",
	"login.emailPlaceholder": "you@example.com",
	"login.submit": "Send Access Link",
	"login.sending": "Sending...",
	"login.success": "Check Your Email",
	"login.successDescription":
		"We've sent an access link to your email. Click the link to access your portal.",
	"login.error": "Something went wrong. Please try again.",
	"login.invalidEmail": "Please enter a valid email address.",

	"token.expired": "Link Expired",
	"token.expiredDescription": "This access link has expired. We'll send you a new one.",
	"token.resending": "Sending new link...",
	"token.resent": "New access link sent! Check your email.",

	"portal.title": "My Submissions",
	"portal.mySubmissions": "My Submissions",
	"portal.search": "Search",
	"portal.searchPlaceholder": "Search by form name or tracking code...",
	"portal.noSubmissions": "No submissions yet",
	"portal.noSubmissionsDescription": "Your form submissions will appear here.",
	"portal.noResults": "No results match your search",
	"portal.logout": "Sign Out",
	"portal.statusAll": "All",
	"portal.statusOpen": "Open",
	"portal.statusRead": "Read",
	"portal.statusClosed": "Closed",

	"detail.trackingCode": "Tracking Code",
	"detail.submittedAt": "Submitted",
	"detail.status": "Status",
	"detail.answers": "Submitted Data",
	"detail.conversation": "Conversation",
	"detail.noReplies": "No replies yet. The team will respond soon.",
	"detail.replyPlaceholder": "Type your message...",
	"detail.sendReply": "Send",
	"detail.sending": "Sending...",
	"detail.back": "Back",
	"detail.adminReply": "Support Team",
	"detail.yourMessage": "You",
	"detail.initialSubmission": "Form Submitted",

	"status.open": "Open",
	"status.read": "In Progress",
	"status.closed": "Closed",

	"common.loading": "Loading...",
	"common.error": "An error occurred",
	"common.retry": "Try Again",
	"common.poweredBy": "Powered by {pluginName} · Made by {studioName}",
	adminLabel: "Support Team",
	youLabel: "You",
};

const fa: PortalTranslations = {
	"login.title": "پرتال پشتیبانی",
	"login.description": "ایمیل خود را وارد کنید تا به درخواست‌ها و پاسخ‌های خود دسترسی پیدا کنید.",
	"login.emailLabel": "آدرس ایمیل",
	"login.emailPlaceholder": "example@email.com",
	"login.submit": "ارسال لینک دسترسی",
	"login.sending": "در حال ارسال...",
	"login.success": "ایمیل خود را بررسی کنید",
	"login.successDescription":
		"لینک دسترسی به ایمیل شما ارسال شد. برای ورود به پرتال روی لینک کلیک کنید.",
	"login.error": "مشکلی پیش آمد. لطفاً دوباره تلاش کنید.",
	"login.invalidEmail": "لطفاً یک آدرس ایمیل معتبر وارد کنید.",

	"token.expired": "لینک منقضی شده",
	"token.expiredDescription": "این لینک دسترسی منقضی شده است. لینک جدید برای شما ارسال خواهد شد.",
	"token.resending": "در حال ارسال لینک جدید...",
	"token.resent": "لینک دسترسی جدید ارسال شد! ایمیل خود را بررسی کنید.",

	"portal.title": "درخواست‌های من",
	"portal.mySubmissions": "درخواست‌های من",
	"portal.search": "جستجو",
	"portal.searchPlaceholder": "جستجو بر اساس نام فرم یا کد رهگیری...",
	"portal.noSubmissions": "هنوز درخواستی ثبت نشده",
	"portal.noSubmissionsDescription": "درخواست‌های فرم شما در اینجا نمایش داده می‌شود.",
	"portal.noResults": "نتیجه‌ای با جستجوی شما مطابقت ندارد",
	"portal.logout": "خروج",
	"portal.statusAll": "همه",
	"portal.statusOpen": "باز",
	"portal.statusRead": "خوانده شده",
	"portal.statusClosed": "بسته شده",

	"detail.trackingCode": "کد رهگیری",
	"detail.submittedAt": "تاریخ ثبت",
	"detail.status": "وضعیت",
	"detail.answers": "اطلاعات ثبت شده",
	"detail.conversation": "مکالمه",
	"detail.noReplies": "هنوز پاسخی ارسال نشده. تیم پشتیبانی به زودی پاسخ خواهد داد.",
	"detail.replyPlaceholder": "پیام خود را بنویسید...",
	"detail.sendReply": "ارسال",
	"detail.sending": "در حال ارسال...",
	"detail.back": "بازگشت",
	"detail.adminReply": "تیم پشتیبانی",
	"detail.yourMessage": "شما",
	"detail.initialSubmission": "فرم ثبت شد",

	"status.open": "باز",
	"status.read": "در حال بررسی",
	"status.closed": "بسته شده",

	"common.loading": "در حال بارگذاری...",
	"common.error": "خطایی رخ داده است",
	"common.retry": "تلاش مجدد",
	"common.poweredBy": "قدرت‌گرفته از {pluginName} · ساخته شده توسط {studioName}",
	adminLabel: "تیم پشتیبانی",
	youLabel: "شما",
};

const ar: PortalTranslations = {
	"login.title": "بوابة الدعم",
	"login.description": "أدخل بريدك الإلكتروني للوصول إلى طلباتك وردودك.",
	"login.emailLabel": "عنوان البريد الإلكتروني",
	"login.emailPlaceholder": "example@email.com",
	"login.submit": "إرسال رابط الوصول",
	"login.sending": "جاري الإرسال...",
	"login.success": "تحقق من بريدك الإلكتروني",
	"login.successDescription": "تم إرسال رابط الوصول إلى بريدك الإلكتروني. انقر على الرابط للدخول.",
	"login.error": "حدث خطأ ما. يرجى المحاولة مرة أخرى.",
	"login.invalidEmail": "يرجى إدخال عنوان بريد إلكتروني صالح.",

	"token.expired": "انتهت صلاحية الرابط",
	"token.expiredDescription": "انتهت صلاحية رابط الوصول هذا. سنرسل لك رابطاً جديداً.",
	"token.resending": "جاري إرسال رابط جديد...",
	"token.resent": "تم إرسال رابط وصول جديد! تحقق من بريدك الإلكتروني.",

	"portal.title": "طلباتي",
	"portal.mySubmissions": "طلباتي",
	"portal.search": "بحث",
	"portal.searchPlaceholder": "البحث حسب اسم النموذج أو رمز التتبع...",
	"portal.noSubmissions": "لا توجد طلبات بعد",
	"portal.noSubmissionsDescription": "ستظهر طلبات النماذج الخاصة بك هنا.",
	"portal.noResults": "لا توجد نتائج مطابقة لبحثك",
	"portal.logout": "تسجيل الخروج",
	"portal.statusAll": "الكل",
	"portal.statusOpen": "مفتوح",
	"portal.statusRead": "مقروء",
	"portal.statusClosed": "مغلق",

	"detail.trackingCode": "رمز التتبع",
	"detail.submittedAt": "تاريخ التقديم",
	"detail.status": "الحالة",
	"detail.answers": "البيانات المقدمة",
	"detail.conversation": "المحادثة",
	"detail.noReplies": "لا توجد ردود بعد. سيرد الفريق قريباً.",
	"detail.replyPlaceholder": "اكتب رسالتك...",
	"detail.sendReply": "إرسال",
	"detail.sending": "جاري الإرسال...",
	"detail.back": "رجوع",
	"detail.adminReply": "فريق الدعم",
	"detail.yourMessage": "أنت",
	"detail.initialSubmission": "تم تقديم النموذج",

	"status.open": "مفتوح",
	"status.read": "قيد المراجعة",
	"status.closed": "مغلق",

	"common.loading": "جاري التحميل...",
	"common.error": "حدث خطأ",
	"common.retry": "حاول مرة أخرى",
	"common.poweredBy": "مدعوم من {pluginName} · صنع بواسطة {studioName}",
	adminLabel: "فريق الدعم",
	youLabel: "أنت",
};

const tr: PortalTranslations = {
	"login.title": "Destek Portalı",
	"login.description": "Gönderilerinize ve yanıtlarınıza erişmek için e-posta adresinizi girin.",
	"login.emailLabel": "E-posta Adresi",
	"login.emailPlaceholder": "ornek@email.com",
	"login.submit": "Erişim Bağlantısı Gönder",
	"login.sending": "Gönderiliyor...",
	"login.success": "E-postanızı Kontrol Edin",
	"login.successDescription":
		"E-postanıza bir erişim bağlantısı gönderdik. Portala erişmek için bağlantıya tıklayın.",
	"login.error": "Bir hata oluştu. Lütfen tekrar deneyin.",
	"login.invalidEmail": "Lütfen geçerli bir e-posta adresi girin.",

	"token.expired": "Bağlantı Süresi Doldu",
	"token.expiredDescription":
		"Bu erişim bağlantısının süresi dolmuştur. Size yeni bir bağlantı göndereceğiz.",
	"token.resending": "Yeni bağlantı gönderiliyor...",
	"token.resent": "Yeni erişim bağlantısı gönderildi! E-postanızı kontrol edin.",

	"portal.title": "Gönderilerim",
	"portal.mySubmissions": "Gönderilerim",
	"portal.search": "Ara",
	"portal.searchPlaceholder": "Form adı veya takip kodu ile ara...",
	"portal.noSubmissions": "Henüz gönderim yok",
	"portal.noSubmissionsDescription": "Form gönderileriniz burada görünecek.",
	"portal.noResults": "Aramanızla eşleşen sonuç yok",
	"portal.logout": "Çıkış Yap",
	"portal.statusAll": "Tümü",
	"portal.statusOpen": "Açık",
	"portal.statusRead": "Okundu",
	"portal.statusClosed": "Kapalı",

	"detail.trackingCode": "Takip Kodu",
	"detail.submittedAt": "Gönderim Tarihi",
	"detail.status": "Durum",
	"detail.answers": "Gönderilen Veriler",
	"detail.conversation": "Konuşma",
	"detail.noReplies": "Henüz yanıt yok. Ekip yakında yanıt verecek.",
	"detail.replyPlaceholder": "Mesajınızı yazın...",
	"detail.sendReply": "Gönder",
	"detail.sending": "Gönderiliyor...",
	"detail.back": "Geri",
	"detail.adminReply": "Destek Ekibi",
	"detail.yourMessage": "Siz",
	"detail.initialSubmission": "Form Gönderildi",

	"status.open": "Açık",
	"status.read": "İnceleniyor",
	"status.closed": "Kapalı",

	"common.loading": "Yükleniyor...",
	"common.error": "Bir hata oluştu",
	"common.retry": "Tekrar Dene",
	"common.poweredBy":
		"{pluginName} tarafından desteklenmektedir · {studioName} tarafından yapılmıştır",
	adminLabel: "Destek Ekibi",
	youLabel: "Siz",
};

// =============================================================================
// Additional Languages (100M+ speakers)
// =============================================================================

const fr: PortalTranslations = {
	"login.title": "Portail d'assistance",
	"login.description": "Entrez votre e-mail pour accéder à vos soumissions et réponses.",
	"login.emailLabel": "Adresse e-mail",
	"login.emailPlaceholder": "vous@exemple.com",
	"login.submit": "Envoyer le lien d'accès",
	"login.sending": "Envoi en cours...",
	"login.success": "Vérifiez votre e-mail",
	"login.successDescription":
		"Un lien d'accès a été envoyé à votre e-mail. Cliquez dessus pour accéder au portail.",
	"login.error": "Une erreur s'est produite. Veuillez réessayer.",
	"login.invalidEmail": "Veuillez entrer une adresse e-mail valide.",
	"token.expired": "Lien expiré",
	"token.expiredDescription": "Ce lien d'accès a expiré. Nous vous en enverrons un nouveau.",
	"token.resending": "Envoi d'un nouveau lien...",
	"token.resent": "Nouveau lien d'accès envoyé ! Vérifiez votre e-mail.",
	"portal.title": "Mes soumissions",
	"portal.mySubmissions": "Mes soumissions",
	"portal.search": "Rechercher",
	"portal.searchPlaceholder": "Rechercher par nom de formulaire ou code de suivi...",
	"portal.noSubmissions": "Aucune soumission pour le moment",
	"portal.noSubmissionsDescription": "Vos soumissions de formulaires apparaîtront ici.",
	"portal.noResults": "Aucun résultat ne correspond à votre recherche",
	"portal.logout": "Se déconnecter",
	"portal.statusAll": "Tous",
	"portal.statusOpen": "Ouvert",
	"portal.statusRead": "Lu",
	"portal.statusClosed": "Fermé",
	"detail.trackingCode": "Code de suivi",
	"detail.submittedAt": "Soumis le",
	"detail.status": "Statut",
	"detail.answers": "Données soumises",
	"detail.conversation": "Conversation",
	"detail.noReplies": "Pas encore de réponse. L'équipe répondra bientôt.",
	"detail.replyPlaceholder": "Écrivez votre message...",
	"detail.sendReply": "Envoyer",
	"detail.sending": "Envoi en cours...",
	"detail.back": "Retour",
	"detail.adminReply": "Équipe d'assistance",
	"detail.yourMessage": "Vous",
	"detail.initialSubmission": "Formulaire soumis",
	"status.open": "Ouvert",
	"status.read": "En cours",
	"status.closed": "Fermé",
	"common.loading": "Chargement...",
	"common.error": "Une erreur est survenue",
	"common.retry": "Réessayer",
	"common.poweredBy": "Propulsé par {pluginName} · Créé par {studioName}",
	adminLabel: "Équipe d'assistance",
	youLabel: "Vous",
};

const de: PortalTranslations = {
	"login.title": "Support-Portal",
	"login.description":
		"Geben Sie Ihre E-Mail-Adresse ein, um auf Ihre Anfragen und Antworten zuzugreifen.",
	"login.emailLabel": "E-Mail-Adresse",
	"login.emailPlaceholder": "name@beispiel.de",
	"login.submit": "Zugangslink senden",
	"login.sending": "Wird gesendet...",
	"login.success": "Prüfen Sie Ihre E-Mail",
	"login.successDescription":
		"Wir haben einen Zugangslink an Ihre E-Mail gesendet. Klicken Sie auf den Link, um auf das Portal zuzugreifen.",
	"login.error": "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.",
	"login.invalidEmail": "Bitte geben Sie eine gültige E-Mail-Adresse ein.",
	"token.expired": "Link abgelaufen",
	"token.expiredDescription": "Dieser Zugangslink ist abgelaufen. Wir senden Ihnen einen neuen.",
	"token.resending": "Neuer Link wird gesendet...",
	"token.resent": "Neuer Zugangslink gesendet! Prüfen Sie Ihre E-Mail.",
	"portal.title": "Meine Anfragen",
	"portal.mySubmissions": "Meine Anfragen",
	"portal.search": "Suchen",
	"portal.searchPlaceholder": "Nach Formularname oder Tracking-Code suchen...",
	"portal.noSubmissions": "Noch keine Anfragen",
	"portal.noSubmissionsDescription": "Ihre Formularanfragen werden hier angezeigt.",
	"portal.noResults": "Keine Ergebnisse für Ihre Suche",
	"portal.logout": "Abmelden",
	"portal.statusAll": "Alle",
	"portal.statusOpen": "Offen",
	"portal.statusRead": "Gelesen",
	"portal.statusClosed": "Geschlossen",
	"detail.trackingCode": "Tracking-Code",
	"detail.submittedAt": "Eingereicht am",
	"detail.status": "Status",
	"detail.answers": "Eingereichte Daten",
	"detail.conversation": "Konversation",
	"detail.noReplies": "Noch keine Antworten. Das Team wird in Kürze antworten.",
	"detail.replyPlaceholder": "Ihre Nachricht eingeben...",
	"detail.sendReply": "Senden",
	"detail.sending": "Wird gesendet...",
	"detail.back": "Zurück",
	"detail.adminReply": "Support-Team",
	"detail.yourMessage": "Sie",
	"detail.initialSubmission": "Formular eingereicht",
	"status.open": "Offen",
	"status.read": "In Bearbeitung",
	"status.closed": "Geschlossen",
	"common.loading": "Wird geladen...",
	"common.error": "Ein Fehler ist aufgetreten",
	"common.retry": "Erneut versuchen",
	"common.poweredBy": "Unterstützt von {pluginName} · Erstellt von {studioName}",
	adminLabel: "Support-Team",
	youLabel: "Sie",
};

const es: PortalTranslations = {
	"login.title": "Portal de soporte",
	"login.description": "Ingrese su correo electrónico para acceder a sus envíos y respuestas.",
	"login.emailLabel": "Correo electrónico",
	"login.emailPlaceholder": "tu@ejemplo.com",
	"login.submit": "Enviar enlace de acceso",
	"login.sending": "Enviando...",
	"login.success": "Revise su correo electrónico",
	"login.successDescription":
		"Hemos enviado un enlace de acceso a su correo. Haga clic en el enlace para acceder al portal.",
	"login.error": "Algo salió mal. Por favor, inténtelo de nuevo.",
	"login.invalidEmail": "Por favor, ingrese un correo electrónico válido.",
	"token.expired": "Enlace expirado",
	"token.expiredDescription": "Este enlace de acceso ha expirado. Le enviaremos uno nuevo.",
	"token.resending": "Enviando nuevo enlace...",
	"token.resent": "¡Nuevo enlace de acceso enviado! Revise su correo.",
	"portal.title": "Mis envíos",
	"portal.mySubmissions": "Mis envíos",
	"portal.search": "Buscar",
	"portal.searchPlaceholder": "Buscar por nombre de formulario o código de seguimiento...",
	"portal.noSubmissions": "Aún no hay envíos",
	"portal.noSubmissionsDescription": "Sus envíos de formularios aparecerán aquí.",
	"portal.noResults": "No hay resultados para su búsqueda",
	"portal.logout": "Cerrar sesión",
	"portal.statusAll": "Todos",
	"portal.statusOpen": "Abierto",
	"portal.statusRead": "Leído",
	"portal.statusClosed": "Cerrado",
	"detail.trackingCode": "Código de seguimiento",
	"detail.submittedAt": "Enviado el",
	"detail.status": "Estado",
	"detail.answers": "Datos enviados",
	"detail.conversation": "Conversación",
	"detail.noReplies": "Aún no hay respuestas. El equipo responderá pronto.",
	"detail.replyPlaceholder": "Escriba su mensaje...",
	"detail.sendReply": "Enviar",
	"detail.sending": "Enviando...",
	"detail.back": "Volver",
	"detail.adminReply": "Equipo de soporte",
	"detail.yourMessage": "Usted",
	"detail.initialSubmission": "Formulario enviado",
	"status.open": "Abierto",
	"status.read": "En proceso",
	"status.closed": "Cerrado",
	"common.loading": "Cargando...",
	"common.error": "Se produjo un error",
	"common.retry": "Reintentar",
	"common.poweredBy": "Impulsado por {pluginName} · Hecho por {studioName}",
	adminLabel: "Equipo de soporte",
	youLabel: "Usted",
};

const pt: PortalTranslations = {
	"login.title": "Portal de suporte",
	"login.description": "Digite seu e-mail para acessar seus envios e respostas.",
	"login.emailLabel": "Endereço de e-mail",
	"login.emailPlaceholder": "voce@exemplo.com",
	"login.submit": "Enviar link de acesso",
	"login.sending": "Enviando...",
	"login.success": "Verifique seu e-mail",
	"login.successDescription":
		"Enviamos um link de acesso para seu e-mail. Clique no link para acessar o portal.",
	"login.error": "Algo deu errado. Por favor, tente novamente.",
	"login.invalidEmail": "Por favor, insira um endereço de e-mail válido.",
	"token.expired": "Link expirado",
	"token.expiredDescription": "Este link de acesso expirou. Enviaremos um novo para você.",
	"token.resending": "Enviando novo link...",
	"token.resent": "Novo link de acesso enviado! Verifique seu e-mail.",
	"portal.title": "Meus envios",
	"portal.mySubmissions": "Meus envios",
	"portal.search": "Pesquisar",
	"portal.searchPlaceholder": "Pesquisar por nome do formulário ou código de rastreamento...",
	"portal.noSubmissions": "Nenhum envio ainda",
	"portal.noSubmissionsDescription": "Seus envios de formulários aparecerão aqui.",
	"portal.noResults": "Nenhum resultado encontrado para sua pesquisa",
	"portal.logout": "Sair",
	"portal.statusAll": "Todos",
	"portal.statusOpen": "Aberto",
	"portal.statusRead": "Lido",
	"portal.statusClosed": "Fechado",
	"detail.trackingCode": "Código de rastreamento",
	"detail.submittedAt": "Enviado em",
	"detail.status": "Status",
	"detail.answers": "Dados enviados",
	"detail.conversation": "Conversa",
	"detail.noReplies": "Nenhuma resposta ainda. A equipe responderá em breve.",
	"detail.replyPlaceholder": "Digite sua mensagem...",
	"detail.sendReply": "Enviar",
	"detail.sending": "Enviando...",
	"detail.back": "Voltar",
	"detail.adminReply": "Equipe de suporte",
	"detail.yourMessage": "Você",
	"detail.initialSubmission": "Formulário enviado",
	"status.open": "Aberto",
	"status.read": "Em andamento",
	"status.closed": "Fechado",
	"common.loading": "Carregando...",
	"common.error": "Ocorreu um erro",
	"common.retry": "Tentar novamente",
	"common.poweredBy": "Desenvolvido com {pluginName} · Feito por {studioName}",
	adminLabel: "Equipe de suporte",
	youLabel: "Você",
};

const zh: PortalTranslations = {
	"login.title": "支持门户",
	"login.description": "输入您的电子邮件以访问您的提交和回复。",
	"login.emailLabel": "电子邮件地址",
	"login.emailPlaceholder": "you@example.com",
	"login.submit": "发送访问链接",
	"login.sending": "发送中...",
	"login.success": "请查收邮件",
	"login.successDescription": "我们已向您的邮箱发送了访问链接。点击链接即可进入门户。",
	"login.error": "出现错误，请重试。",
	"login.invalidEmail": "请输入有效的电子邮件地址。",
	"token.expired": "链接已过期",
	"token.expiredDescription": "此访问链接已过期。我们将向您发送新的链接。",
	"token.resending": "正在发送新链接...",
	"token.resent": "新访问链接已发送！请查收邮件。",
	"portal.title": "我的提交",
	"portal.mySubmissions": "我的提交",
	"portal.search": "搜索",
	"portal.searchPlaceholder": "按表单名称或跟踪代码搜索...",
	"portal.noSubmissions": "暂无提交",
	"portal.noSubmissionsDescription": "您的表单提交将显示在此处。",
	"portal.noResults": "没有匹配的搜索结果",
	"portal.logout": "退出登录",
	"portal.statusAll": "全部",
	"portal.statusOpen": "待处理",
	"portal.statusRead": "已读",
	"portal.statusClosed": "已关闭",
	"detail.trackingCode": "跟踪代码",
	"detail.submittedAt": "提交时间",
	"detail.status": "状态",
	"detail.answers": "提交的数据",
	"detail.conversation": "对话",
	"detail.noReplies": "暂无回复。团队将尽快回复。",
	"detail.replyPlaceholder": "输入您的消息...",
	"detail.sendReply": "发送",
	"detail.sending": "发送中...",
	"detail.back": "返回",
	"detail.adminReply": "支持团队",
	"detail.yourMessage": "您",
	"detail.initialSubmission": "表单已提交",
	"status.open": "待处理",
	"status.read": "处理中",
	"status.closed": "已关闭",
	"common.loading": "加载中...",
	"common.error": "发生错误",
	"common.retry": "重试",
	"common.poweredBy": "由 {pluginName} 提供支持 · {studioName} 制作",
	adminLabel: "支持团队",
	youLabel: "您",
};

const ru: PortalTranslations = {
	"login.title": "Портал поддержки",
	"login.description": "Введите ваш email для доступа к заявкам и ответам.",
	"login.emailLabel": "Электронная почта",
	"login.emailPlaceholder": "you@example.com",
	"login.submit": "Отправить ссылку для входа",
	"login.sending": "Отправка...",
	"login.success": "Проверьте почту",
	"login.successDescription":
		"Мы отправили ссылку для входа на вашу почту. Нажмите на ссылку для доступа к порталу.",
	"login.error": "Произошла ошибка. Пожалуйста, попробуйте снова.",
	"login.invalidEmail": "Пожалуйста, введите корректный email.",
	"token.expired": "Ссылка устарела",
	"token.expiredDescription": "Эта ссылка для входа устарела. Мы отправим вам новую.",
	"token.resending": "Отправка новой ссылки...",
	"token.resent": "Новая ссылка отправлена! Проверьте почту.",
	"portal.title": "Мои заявки",
	"portal.mySubmissions": "Мои заявки",
	"portal.search": "Поиск",
	"portal.searchPlaceholder": "Поиск по названию формы или коду отслеживания...",
	"portal.noSubmissions": "Заявок пока нет",
	"portal.noSubmissionsDescription": "Ваши отправленные формы появятся здесь.",
	"portal.noResults": "По вашему запросу ничего не найдено",
	"portal.logout": "Выйти",
	"portal.statusAll": "Все",
	"portal.statusOpen": "Открыто",
	"portal.statusRead": "Прочитано",
	"portal.statusClosed": "Закрыто",
	"detail.trackingCode": "Код отслеживания",
	"detail.submittedAt": "Дата отправки",
	"detail.status": "Статус",
	"detail.answers": "Отправленные данные",
	"detail.conversation": "Переписка",
	"detail.noReplies": "Ответов пока нет. Команда скоро ответит.",
	"detail.replyPlaceholder": "Введите сообщение...",
	"detail.sendReply": "Отправить",
	"detail.sending": "Отправка...",
	"detail.back": "Назад",
	"detail.adminReply": "Команда поддержки",
	"detail.yourMessage": "Вы",
	"detail.initialSubmission": "Форма отправлена",
	"status.open": "Открыто",
	"status.read": "На рассмотрении",
	"status.closed": "Закрыто",
	"common.loading": "Загрузка...",
	"common.error": "Произошла ошибка",
	"common.retry": "Повторить",
	"common.poweredBy": "Работает на {pluginName} · Сделано {studioName}",
	adminLabel: "Команда поддержки",
	youLabel: "Вы",
};

const hi: PortalTranslations = {
	"login.title": "सहायता पोर्टल",
	"login.description": "अपने सबमिशन और उत्तरों तक पहुँचने के लिए अपना ईमेल दर्ज करें।",
	"login.emailLabel": "ईमेल पता",
	"login.emailPlaceholder": "you@example.com",
	"login.submit": "एक्सेस लिंक भेजें",
	"login.sending": "भेजा जा रहा है...",
	"login.success": "अपना ईमेल जाँचें",
	"login.successDescription":
		"हमने आपके ईमेल पर एक्सेस लिंक भेज दिया है। पोर्टल तक पहुँचने के लिए लिंक पर क्लिक करें।",
	"login.error": "कुछ गलत हो गया। कृपया पुनः प्रयास करें।",
	"login.invalidEmail": "कृपया एक मान्य ईमेल पता दर्ज करें।",
	"token.expired": "लिंक समाप्त हो गया",
	"token.expiredDescription": "यह एक्सेस लिंक समाप्त हो गया है। हम आपको नया भेजेंगे।",
	"token.resending": "नया लिंक भेजा जा रहा है...",
	"token.resent": "नया एक्सेस लिंक भेजा गया! अपना ईमेल जाँचें।",
	"portal.title": "मेरे सबमिशन",
	"portal.mySubmissions": "मेरे सबमिशन",
	"portal.search": "खोजें",
	"portal.searchPlaceholder": "फॉर्म नाम या ट्रैकिंग कोड से खोजें...",
	"portal.noSubmissions": "अभी तक कोई सबमिशन नहीं",
	"portal.noSubmissionsDescription": "आपके फॉर्म सबमिशन यहाँ दिखाई देंगे।",
	"portal.noResults": "आपकी खोज से कोई परिणाम नहीं मिला",
	"portal.logout": "साइन आउट",
	"portal.statusAll": "सभी",
	"portal.statusOpen": "खुला",
	"portal.statusRead": "पढ़ा गया",
	"portal.statusClosed": "बंद",
	"detail.trackingCode": "ट्रैकिंग कोड",
	"detail.submittedAt": "जमा किया गया",
	"detail.status": "स्थिति",
	"detail.answers": "जमा किया गया डेटा",
	"detail.conversation": "वार्तालाप",
	"detail.noReplies": "अभी तक कोई उत्तर नहीं। टीम जल्द ही उत्तर देगी।",
	"detail.replyPlaceholder": "अपना संदेश लिखें...",
	"detail.sendReply": "भेजें",
	"detail.sending": "भेजा जा रहा है...",
	"detail.back": "वापस",
	"detail.adminReply": "सहायता टीम",
	"detail.yourMessage": "आप",
	"detail.initialSubmission": "फॉर्म जमा किया गया",
	"status.open": "खुला",
	"status.read": "समीक्षाधीन",
	"status.closed": "बंद",
	"common.loading": "लोड हो रहा है...",
	"common.error": "एक त्रुटि हुई",
	"common.retry": "पुनः प्रयास करें",
	"common.poweredBy": "{pluginName} द्वारा संचालित · {studioName} द्वारा निर्मित",
	adminLabel: "सहायता टीम",
	youLabel: "आप",
};

const bn: PortalTranslations = {
	"login.title": "সাপোর্ট পোর্টাল",
	"login.description": "আপনার জমা এবং উত্তরগুলি অ্যাক্সেস করতে আপনার ইমেল লিখুন।",
	"login.emailLabel": "ইমেল ঠিকানা",
	"login.emailPlaceholder": "you@example.com",
	"login.submit": "অ্যাক্সেস লিংক পাঠান",
	"login.sending": "পাঠানো হচ্ছে...",
	"login.success": "আপনার ইমেল চেক করুন",
	"login.successDescription":
		"আমরা আপনার ইমেলে একটি অ্যাক্সেস লিংক পাঠিয়েছি। পোর্টালে প্রবেশ করতে লিংকে ক্লিক করুন।",
	"login.error": "কিছু ভুল হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।",
	"login.invalidEmail": "অনুগ্রহ করে একটি বৈধ ইমেল ঠিকানা লিখুন।",
	"token.expired": "লিংক মেয়াদ উত্তীর্ণ",
	"token.expiredDescription": "এই অ্যাক্সেস লিংকের মেয়াদ শেষ হয়ে গেছে। আমরা আপনাকে নতুন একটি পাঠাব।",
	"token.resending": "নতুন লিংক পাঠানো হচ্ছে...",
	"token.resent": "নতুন অ্যাক্সেস লিংক পাঠানো হয়েছে! আপনার ইমেল চেক করুন।",
	"portal.title": "আমার জমাগুলি",
	"portal.mySubmissions": "আমার জমাগুলি",
	"portal.search": "অনুসন্ধান",
	"portal.searchPlaceholder": "ফর্মের নাম বা ট্র্যাকিং কোড দিয়ে খুঁজুন...",
	"portal.noSubmissions": "এখনও কোনো জমা নেই",
	"portal.noSubmissionsDescription": "আপনার ফর্ম জমাগুলি এখানে দেখা যাবে।",
	"portal.noResults": "আপনার অনুসন্ধানের সাথে কোনো ফলাফল মেলেনি",
	"portal.logout": "সাইন আউট",
	"portal.statusAll": "সব",
	"portal.statusOpen": "খোলা",
	"portal.statusRead": "পড়া হয়েছে",
	"portal.statusClosed": "বন্ধ",
	"detail.trackingCode": "ট্র্যাকিং কোড",
	"detail.submittedAt": "জমা দেওয়ার তারিখ",
	"detail.status": "অবস্থা",
	"detail.answers": "জমাকৃত তথ্য",
	"detail.conversation": "কথোপকথন",
	"detail.noReplies": "এখনও কোনো উত্তর নেই। দল শীঘ্রই উত্তর দেবে।",
	"detail.replyPlaceholder": "আপনার বার্তা লিখুন...",
	"detail.sendReply": "পাঠান",
	"detail.sending": "পাঠানো হচ্ছে...",
	"detail.back": "ফিরে যান",
	"detail.adminReply": "সাপোর্ট টিম",
	"detail.yourMessage": "আপনি",
	"detail.initialSubmission": "ফর্ম জমা দেওয়া হয়েছে",
	"status.open": "খোলা",
	"status.read": "পর্যালোচনাধীন",
	"status.closed": "বন্ধ",
	"common.loading": "লোড হচ্ছে...",
	"common.error": "একটি ত্রুটি ঘটেছে",
	"common.retry": "আবার চেষ্টা করুন",
	"common.poweredBy": "{pluginName} দ্বারা চালিত · {studioName} দ্বারা নির্মিত",
	adminLabel: "সাপোর্ট টিম",
	youLabel: "আপনি",
};

const ja: PortalTranslations = {
	"login.title": "サポートポータル",
	"login.description": "送信内容と回答にアクセスするには、メールアドレスを入力してください。",
	"login.emailLabel": "メールアドレス",
	"login.emailPlaceholder": "you@example.com",
	"login.submit": "アクセスリンクを送信",
	"login.sending": "送信中...",
	"login.success": "メールをご確認ください",
	"login.successDescription":
		"アクセスリンクをメールで送信しました。リンクをクリックしてポータルにアクセスしてください。",
	"login.error": "エラーが発生しました。もう一度お試しください。",
	"login.invalidEmail": "有効なメールアドレスを入力してください。",
	"token.expired": "リンクの有効期限切れ",
	"token.expiredDescription": "このアクセスリンクは期限切れです。新しいリンクをお送りします。",
	"token.resending": "新しいリンクを送信中...",
	"token.resent": "新しいアクセスリンクを送信しました！メールをご確認ください。",
	"portal.title": "送信一覧",
	"portal.mySubmissions": "送信一覧",
	"portal.search": "検索",
	"portal.searchPlaceholder": "フォーム名またはトラッキングコードで検索...",
	"portal.noSubmissions": "送信はまだありません",
	"portal.noSubmissionsDescription": "フォームの送信内容がここに表示されます。",
	"portal.noResults": "検索条件に一致する結果はありません",
	"portal.logout": "ログアウト",
	"portal.statusAll": "すべて",
	"portal.statusOpen": "未対応",
	"portal.statusRead": "確認済み",
	"portal.statusClosed": "完了",
	"detail.trackingCode": "トラッキングコード",
	"detail.submittedAt": "送信日時",
	"detail.status": "ステータス",
	"detail.answers": "送信データ",
	"detail.conversation": "会話",
	"detail.noReplies": "まだ返信はありません。チームがまもなく対応します。",
	"detail.replyPlaceholder": "メッセージを入力...",
	"detail.sendReply": "送信",
	"detail.sending": "送信中...",
	"detail.back": "戻る",
	"detail.adminReply": "サポートチーム",
	"detail.yourMessage": "あなた",
	"detail.initialSubmission": "フォーム送信済み",
	"status.open": "未対応",
	"status.read": "対応中",
	"status.closed": "完了",
	"common.loading": "読み込み中...",
	"common.error": "エラーが発生しました",
	"common.retry": "再試行",
	"common.poweredBy": "{pluginName} 提供 · {studioName} 制作",
	adminLabel: "サポートチーム",
	youLabel: "あなた",
};

const ur: PortalTranslations = {
	"login.title": "سپورٹ پورٹل",
	"login.description": "اپنی جمع کرائیں اور جوابات تک رسائی کے لیے اپنا ای میل درج کریں۔",
	"login.emailLabel": "ای میل پتہ",
	"login.emailPlaceholder": "you@example.com",
	"login.submit": "رسائی لنک بھیجیں",
	"login.sending": "بھیجا جا رہا ہے...",
	"login.success": "اپنا ای میل چیک کریں",
	"login.successDescription":
		"ہم نے آپ کے ای میل پر رسائی لنک بھیج دیا ہے۔ پورٹل تک رسائی کے لیے لنک پر کلک کریں۔",
	"login.error": "کچھ غلط ہو گیا۔ براہ کرم دوبارہ کوشش کریں۔",
	"login.invalidEmail": "براہ کرم ایک درست ای میل پتہ درج کریں۔",
	"token.expired": "لنک کی میعاد ختم ہو گئی",
	"token.expiredDescription": "اس رسائی لنک کی میعاد ختم ہو گئی ہے۔ ہم آپ کو نیا بھیجیں گے۔",
	"token.resending": "نیا لنک بھیجا جا رہا ہے...",
	"token.resent": "نیا رسائی لنک بھیج دیا گیا! اپنا ای میل چیک کریں۔",
	"portal.title": "میری جمع کرائیں",
	"portal.mySubmissions": "میری جمع کرائیں",
	"portal.search": "تلاش",
	"portal.searchPlaceholder": "فارم کا نام یا ٹریکنگ کوڈ سے تلاش کریں...",
	"portal.noSubmissions": "ابھی تک کوئی جمع نہیں",
	"portal.noSubmissionsDescription": "آپ کی فارم جمع کرائیں یہاں ظاہر ہوں گی۔",
	"portal.noResults": "آپ کی تلاش سے کوئی نتیجہ نہیں ملا",
	"portal.logout": "سائن آؤٹ",
	"portal.statusAll": "سب",
	"portal.statusOpen": "کھلا",
	"portal.statusRead": "پڑھا گیا",
	"portal.statusClosed": "بند",
	"detail.trackingCode": "ٹریکنگ کوڈ",
	"detail.submittedAt": "جمع کرانے کی تاریخ",
	"detail.status": "حالت",
	"detail.answers": "جمع کرایا گیا ڈیٹا",
	"detail.conversation": "گفتگو",
	"detail.noReplies": "ابھی تک کوئی جواب نہیں۔ ٹیم جلد جواب دے گی۔",
	"detail.replyPlaceholder": "اپنا پیغام لکھیں...",
	"detail.sendReply": "بھیجیں",
	"detail.sending": "بھیجا جا رہا ہے...",
	"detail.back": "واپس",
	"detail.adminReply": "سپورٹ ٹیم",
	"detail.yourMessage": "آپ",
	"detail.initialSubmission": "فارم جمع کرایا گیا",
	"status.open": "کھلا",
	"status.read": "زیر جائزہ",
	"status.closed": "بند",
	"common.loading": "لوڈ ہو رہا ہے...",
	"common.error": "ایک خرابی پیش آئی",
	"common.retry": "دوبارہ کوشش کریں",
	"common.poweredBy": "{pluginName} کی طاقت سے · {studioName} کی تخلیق",
	adminLabel: "سپورٹ ٹیم",
	youLabel: "آپ",
};

const id: PortalTranslations = {
	"login.title": "Portal Dukungan",
	"login.description": "Masukkan email Anda untuk mengakses pengajuan dan tanggapan Anda.",
	"login.emailLabel": "Alamat Email",
	"login.emailPlaceholder": "anda@contoh.com",
	"login.submit": "Kirim Tautan Akses",
	"login.sending": "Mengirim...",
	"login.success": "Periksa Email Anda",
	"login.successDescription":
		"Kami telah mengirim tautan akses ke email Anda. Klik tautan untuk masuk ke portal.",
	"login.error": "Terjadi kesalahan. Silakan coba lagi.",
	"login.invalidEmail": "Silakan masukkan alamat email yang valid.",
	"token.expired": "Tautan Kedaluwarsa",
	"token.expiredDescription":
		"Tautan akses ini telah kedaluwarsa. Kami akan mengirimkan yang baru.",
	"token.resending": "Mengirim tautan baru...",
	"token.resent": "Tautan akses baru terkirim! Periksa email Anda.",
	"portal.title": "Pengajuan Saya",
	"portal.mySubmissions": "Pengajuan Saya",
	"portal.search": "Cari",
	"portal.searchPlaceholder": "Cari berdasarkan nama formulir atau kode pelacakan...",
	"portal.noSubmissions": "Belum ada pengajuan",
	"portal.noSubmissionsDescription": "Pengajuan formulir Anda akan muncul di sini.",
	"portal.noResults": "Tidak ada hasil yang cocok dengan pencarian Anda",
	"portal.logout": "Keluar",
	"portal.statusAll": "Semua",
	"portal.statusOpen": "Terbuka",
	"portal.statusRead": "Dibaca",
	"portal.statusClosed": "Ditutup",
	"detail.trackingCode": "Kode Pelacakan",
	"detail.submittedAt": "Tanggal Pengajuan",
	"detail.status": "Status",
	"detail.answers": "Data yang Dikirim",
	"detail.conversation": "Percakapan",
	"detail.noReplies": "Belum ada balasan. Tim akan segera merespons.",
	"detail.replyPlaceholder": "Ketik pesan Anda...",
	"detail.sendReply": "Kirim",
	"detail.sending": "Mengirim...",
	"detail.back": "Kembali",
	"detail.adminReply": "Tim Dukungan",
	"detail.yourMessage": "Anda",
	"detail.initialSubmission": "Formulir Terkirim",
	"status.open": "Terbuka",
	"status.read": "Sedang Ditinjau",
	"status.closed": "Ditutup",
	"common.loading": "Memuat...",
	"common.error": "Terjadi kesalahan",
	"common.retry": "Coba Lagi",
	"common.poweredBy": "Didukung oleh {pluginName} · Dibuat oleh {studioName}",
	adminLabel: "Tim Dukungan",
	youLabel: "Anda",
};

// =============================================================================
// Translation Registry
// =============================================================================

const TRANSLATIONS: Record<string, PortalTranslations> = {
	en,
	fa,
	ar,
	tr,
	fr,
	de,
	es,
	pt,
	zh,
	ru,
	hi,
	bn,
	ja,
	ur,
	id,
};

/**
 * Get translations for a locale, falling back to English.
 */
export function getTranslations(locale: string): PortalTranslations {
	const base = locale.split("-")[0]?.toLowerCase() ?? "en";
	return TRANSLATIONS[base] ?? TRANSLATIONS.en!;
}

/**
 * Get a single translated string.
 */
export function t(locale: string, key: keyof PortalTranslations): string {
	const translations = getTranslations(locale);
	return translations[key] ?? key;
}

/**
 * Get all available locale codes.
 */
export function getAvailableLocales(): string[] {
	return Object.keys(TRANSLATIONS);
}

/**
 * Get locale display name (in its own language).
 */
const LOCALE_NAMES: Record<string, string> = {
	en: "English",
	fa: "فارسی",
	ar: "العربية",
	tr: "Türkçe",
	fr: "Français",
	de: "Deutsch",
	es: "Español",
	pt: "Português",
	zh: "中文",
	ru: "Русский",
	hi: "हिन्दी",
	bn: "বাংলা",
	ja: "日本語",
	ur: "اردو",
	id: "Bahasa Indonesia",
};

export function getLocaleName(locale: string): string {
	const base = locale.split("-")[0]?.toLowerCase() ?? "";
	return LOCALE_NAMES[base] ?? locale;
}
