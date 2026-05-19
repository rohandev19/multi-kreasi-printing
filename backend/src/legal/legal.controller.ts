import { Controller, Get } from '@nestjs/common';

@Controller('api/v1/legal')
export class LegalController {
  @Get('terms')
  getTermsOfService() {
    return {
      title: 'Terms of Service',
      lastUpdated: '2023-10-25',
      content:
        'By using Multi Kreasi Printing platform, you agree to our terms of service...',
      // For MVP, returning static text or an external URL to a hosted terms page
    };
  }

  @Get('privacy')
  getPrivacyPolicy() {
    return {
      title: 'Privacy Policy',
      lastUpdated: '2023-10-25',
      content:
        'We take your privacy seriously. Your data is protected under GDPR and PDPA...',
      // For MVP, returning static text or an external URL to a hosted privacy page
    };
  }
}
