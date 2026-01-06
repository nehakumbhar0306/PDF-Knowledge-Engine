
export interface ExtractedTable {
  id: string;
  headers: string[];
  rows: any[][];
  caption: string;
}

export interface ExtractedSection {
  id: string;
  title: string;
  level: number;
  content: string;
}

export interface ExtractedVisual {
  id: string;
  type: 'image' | 'chart' | 'diagram';
  description: string;
}

export interface DocumentKnowledge {
  id: string;
  fileName: string;
  fileSize: number;
  processedAt: number;
  sections: ExtractedSection[];
  tables: ExtractedTable[];
  visuals: ExtractedVisual[];
  fullText: string;
}

export type ProcessingStatus = 'idle' | 'uploading' | 'processing' | 'completed' | 'error';

export interface SearchResult {
  docId: string;
  fileName: string;
  matches: {
    type: 'section' | 'table' | 'visual';
    score: number;
    snippet: string;
    targetId: string;
  }[];
}
