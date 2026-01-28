export const registerTranslations = {
  fr: {
    // Step 1
    createAccount: 'Créer un compte',
    step1of3: 'Étape 1 sur 3',
    email: 'Courriel',
    emailPlaceholder: 'votre@courriel.com',
    password: 'Mot de passe',
    passwordPlaceholder: 'Minimum 6 caractères',
    confirmPassword: 'Confirmer le mot de passe',
    confirmPasswordPlaceholder: 'Confirmez votre mot de passe',
    stateProvince: 'État / Province',
    stateProvincePlaceholder: 'Sélectionne ton état/province',
    ageConfirmation: 'Je confirme avoir 18 ans ou plus',
    continue: 'Continuer',
    legalMention: 'En créant un compte, tu acceptes nos conditions d\'utilisation et notre politique de confidentialité.',
    alreadyAccount: 'Déjà un compte ? ',
    login: 'Se connecter',
    close: 'Fermer',
    // Step 1 errors
    errorFillFields: 'Remplis tous les champs obligatoires',
    errorInvalidEmail: 'Entre une adresse courriel valide',
    errorPasswordLength: 'Le mot de passe doit contenir au moins 6 caractères',
    errorPasswordMatch: 'Les mots de passe ne correspondent pas',
    errorSelectState: 'Sélectionne ton état/province',
    errorAge: 'Tu dois avoir 18 ans ou plus pour créer un compte',

    // Step 2
    personalization: 'Personnalisation',
    step2of3: 'Étape 2 sur 3',
    chooseAvatar: 'Choisissez votre avatar',
    username: 'Nom d\'utilisateur',
    usernamePlaceholder: 'TonPseudo',
    usernameHint: 'Sera affiché dans le chat et ton profil',
    // Step 2 errors
    errorEnterUsername: 'Entre un nom d\'utilisateur',
    errorUsernameMin: 'Le nom d\'utilisateur doit contenir au moins 3 caractères',
    errorUsernameMax: 'Le nom d\'utilisateur ne peut pas dépasser 20 caractères',

    // Step 3
    newsletter: 'Infolettre',
    step3of3: 'Étape 3 sur 3',
    newsletterQuestion: 'Veux-tu recevoir notre infolettre ?',
    newsletterHint: 'Reste informé des dernières nouvelles sportives, des promotions exclusives et des événements spéciaux.',
    yesSubscribe: 'Oui, je m\'inscris',
    noThanks: 'Non merci',
    createMyAccount: 'Créer mon compte',
    // Step 3 errors
    errorNewsletterChoice: 'Indique si tu veux recevoir notre infolettre',

    // Success
    successTitle: 'Inscription réussie !',
    successMessage: 'Vérifie ton courriel pour confirmer ton compte, puis connecte-toi.',
    goToLogin: 'Aller à la connexion',
  },
  en: {
    // Step 1
    createAccount: 'Create Account',
    step1of3: 'Step 1 of 3',
    email: 'Email',
    emailPlaceholder: 'your@email.com',
    password: 'Password',
    passwordPlaceholder: 'Minimum 6 characters',
    confirmPassword: 'Confirm Password',
    confirmPasswordPlaceholder: 'Confirm your password',
    stateProvince: 'State / Province',
    stateProvincePlaceholder: 'Select your state/province',
    ageConfirmation: 'I confirm that I am 18 years or older',
    continue: 'Continue',
    legalMention: 'By creating an account, you agree to our terms of use and privacy policy.',
    alreadyAccount: 'Already have an account? ',
    login: 'Log in',
    close: 'Close',
    // Step 1 errors
    errorFillFields: 'Please fill in all required fields',
    errorInvalidEmail: 'Please enter a valid email address',
    errorPasswordLength: 'Password must be at least 6 characters',
    errorPasswordMatch: 'Passwords do not match',
    errorSelectState: 'Please select your state/province',
    errorAge: 'You must be 18 years or older to create an account',

    // Step 2
    personalization: 'Personalization',
    step2of3: 'Step 2 of 3',
    chooseAvatar: 'Choose your avatar',
    username: 'Username',
    usernamePlaceholder: 'YourUsername',
    usernameHint: 'Will be displayed in chat and your profile',
    // Step 2 errors
    errorEnterUsername: 'Please enter a username',
    errorUsernameMin: 'Username must be at least 3 characters',
    errorUsernameMax: 'Username cannot exceed 20 characters',

    // Step 3
    newsletter: 'Newsletter',
    step3of3: 'Step 3 of 3',
    newsletterQuestion: 'Would you like to receive our newsletter?',
    newsletterHint: 'Stay informed about the latest sports news, exclusive promotions, and special events.',
    yesSubscribe: 'Yes, sign me up',
    noThanks: 'No thanks',
    createMyAccount: 'Create my account',
    // Step 3 errors
    errorNewsletterChoice: 'Please indicate if you want to receive our newsletter',

    // Success
    successTitle: 'Registration successful!',
    successMessage: 'Check your email to confirm your account, then log in.',
    goToLogin: 'Go to login',
  },
}

export type RegisterTranslations = typeof registerTranslations.fr
