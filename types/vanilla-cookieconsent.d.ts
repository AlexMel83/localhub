declare module 'vanilla-cookieconsent' {
  export interface ConsentModalOptions {
    layout?: string;
    position?: string;
  }

  export interface LanguageOptions {
    default: string;
    translations: Record<string, any>;
  }

  export interface CategoryOptions {
    enabled: boolean;
    readOnly?: boolean;
    autoRun?: boolean;
  }

  export interface Config {
    guiOptions: {
      consentModal: ConsentModalOptions;
      settingsModal?: ConsentModalOptions;
    };
    categories: Record<string, CategoryOptions>;
    language: LanguageOptions;
    onAccept?: (cookie: any) => void;
    onChange?: (cookie: any) => void;
  }

  export function run(config: Config): void;
}

declare module 'vanilla-cookieconsent/dist/cookieconsent.css' {
  const value: string;
  export default value;
}
