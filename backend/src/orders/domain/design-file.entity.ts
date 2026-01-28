export enum DesignFileStatus {
  Uploaded = 'Uploaded',
  AI_Check = 'AI_Check',
  Manual_Review = 'Manual_Review',
  Approved = 'Approved',
  Rejected = 'Rejected',
  Revision_Required = 'Revision_Required'
}

export class DesignFileLogic {
  static getNextVersion(currentVersion?: number): number {
    return currentVersion ? currentVersion + 1 : 1;
  }

  static isValidTransition(currentStatus: string, nextStatus: string): boolean {
    const transitions: Record<string, string[]> = {
      [DesignFileStatus.Uploaded]: [DesignFileStatus.AI_Check, DesignFileStatus.Manual_Review],
      [DesignFileStatus.AI_Check]: [DesignFileStatus.Manual_Review, DesignFileStatus.Approved, DesignFileStatus.Rejected],
      [DesignFileStatus.Manual_Review]: [DesignFileStatus.Approved, DesignFileStatus.Rejected, DesignFileStatus.Revision_Required],
      [DesignFileStatus.Approved]: [],
      [DesignFileStatus.Rejected]: [],
      [DesignFileStatus.Revision_Required]: [DesignFileStatus.Uploaded]
    };
    
    return transitions[currentStatus]?.includes(nextStatus) || false;
  }

  static isValidFileType(mimeType: string): boolean {
    const allowed = [
      'image/vnd.adobe.photoshop', // PSD
      'application/postscript', // AI
      'application/pdf', // PDF
      'image/jpeg', // JPG
      'image/png' // PNG
      // SVG removed per security Option A
    ];
    return allowed.includes(mimeType);
  }

  static isValidFileSize(sizeBytes: number): boolean {
    const maxSize = 100 * 1024 * 1024; // 100MB
    return sizeBytes <= maxSize;
  }
}
