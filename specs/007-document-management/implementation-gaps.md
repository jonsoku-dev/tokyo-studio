# SPEC 007: Document Management Interface - Implementation Gaps

## 문서 정보
- **작성일**: 2025-12-28
- **상태**: 보완 필요
- **우선순위**: High

---

## 1. 누락된 핵심 기능 (Critical)

### 1.1 Built-in PDF Viewer (FR-007, FR-008)
**상태**: ❌ 미구현 - **BLOCKING UX**

**요구사항**:
- 문서 다운로드 없이 브라우저에서 직접 열람
- 줌 컨트롤 (확대/축소)
- 페이지 네비게이션 (다중 페이지 PDF)

**현재 상태**:
- 다운로드만 가능
- 미리보기 없음

**구현 필요 사항**:

```typescript
// 1. Install PDF Viewer Library
// package.json
{
  "dependencies": {
    "react-pdf": "^7.7.0",
    "pdfjs-dist": "^3.11.174"
  }
}

// 2. PDF Viewer Component
// app/features/documents/components/PDFViewer.tsx
import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Configure worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFViewerProps {
  documentUrl: string;
  filename: string;
  onClose: () => void;
}

export function PDFViewer({ documentUrl, filename, onClose }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  const zoomIn = () => setScale((prev) => Math.min(prev + 0.25, 3.0));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.25, 0.5));
  const resetZoom = () => setScale(1.0);

  const goToPrevPage = () => setPageNumber((prev) => Math.max(prev - 1, 1));
  const goToNextPage = () => setPageNumber((prev) => Math.min(prev + 1, numPages));

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-900 text-white">
        <h2 className="text-lg font-semibold truncate flex-1">{filename}</h2>

        {/* Zoom Controls */}
        <div className="flex items-center gap-2 mx-4">
          <button
            onClick={zoomOut}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded"
            disabled={scale <= 0.5}
          >
            -
          </button>
          <span className="text-sm w-16 text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={zoomIn}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded"
            disabled={scale >= 3.0}
          >
            +
          </button>
          <button
            onClick={resetZoom}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm"
          >
            Reset
          </button>
        </div>

        {/* Page Controls */}
        {numPages > 1 && (
          <div className="flex items-center gap-2 mx-4">
            <button
              onClick={goToPrevPage}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded"
              disabled={pageNumber <= 1}
            >
              ←
            </button>
            <span className="text-sm">
              Page {pageNumber} of {numPages}
            </span>
            <button
              onClick={goToNextPage}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded"
              disabled={pageNumber >= numPages}
            >
              →
            </button>
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
        >
          Close
        </button>
      </div>

      {/* PDF Document */}
      <div className="flex-1 overflow-auto bg-gray-800 flex items-center justify-center p-8">
        <Document
          file={documentUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="text-white">Loading PDF...</div>
          }
          error={
            <div className="text-red-500">Failed to load PDF</div>
          }
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            renderTextLayer={true}
            renderAnnotationLayer={true}
          />
        </Document>
      </div>

      {/* Keyboard Shortcuts Help */}
      <div className="p-2 bg-gray-900 text-gray-400 text-xs text-center">
        Keyboard: ← → (Navigate) | +/- (Zoom) | ESC (Close)
      </div>
    </div>
  );
}

// 3. Add Keyboard Shortcuts
export function PDFViewerWithShortcuts(props: PDFViewerProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          props.onClose();
          break;
        case 'ArrowLeft':
          goToPrevPage();
          break;
        case 'ArrowRight':
          goToNextPage();
          break;
        case '+':
        case '=':
          zoomIn();
          break;
        case '-':
          zoomOut();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pageNumber, scale]);

  return <PDFViewer {...props} />;
}

// 4. Integrate into Document Grid
// app/features/documents/components/DocumentGrid.tsx
export function DocumentGrid() {
  const [viewingDocument, setViewingDocument] = useState<Document | null>(null);

  async function handleViewDocument(document: Document) {
    // Get presigned download URL
    const response = await fetch(`/api/storage/download/${document.id}`);
    const { downloadUrl } = await response.json();

    setViewingDocument({
      ...document,
      url: downloadUrl,
    });
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-4">
        {documents.map((doc) => (
          <DocumentCard
            key={doc.id}
            document={doc}
            onView={() => handleViewDocument(doc)}
          />
        ))}
      </div>

      {/* PDF Viewer Modal */}
      {viewingDocument && (
        <PDFViewer
          documentUrl={viewingDocument.url}
          filename={viewingDocument.name}
          onClose={() => setViewingDocument(null)}
        />
      )}
    </>
  );
}

// 5. Update Document Card
export function DocumentCard({ document, onView }: DocumentCardProps) {
  return (
    <div className="border rounded-lg p-4">
      {/* Thumbnail */}
      {document.thumbnailUrl && (
        <img
          src={document.thumbnailUrl}
          alt={document.name}
          className="w-full h-48 object-cover rounded mb-2"
        />
      )}

      {/* Document Info */}
      <h3 className="font-medium truncate">{document.name}</h3>
      <p className="text-sm text-gray-600">{formatFileSize(document.size)}</p>

      {/* Actions */}
      <div className="flex gap-2 mt-4">
        {document.mimeType === 'application/pdf' && (
          <button
            onClick={onView}
            className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            View
          </button>
        )}
        <button
          onClick={() => downloadDocument(document.id)}
          className="flex-1 px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Download
        </button>
      </div>
    </div>
  );
}
```

**우선순위**: **CRITICAL** - UX 필수
**예상 작업량**: 1.5일

---

### 1.2 PDF Thumbnail Preview (FR-004)
**상태**: ❌ 서비스 스텁만 존재

**요구사항**:
- 문서 그리드에 PDF 첫 페이지 썸네일 표시

**현재 상태**:
- 썸네일 생성 서비스 스텁 존재
- 실제 생성 로직 미구현

**구현 필요 사항**:

```typescript
// This is already covered in SPEC 006 (2.1)
// Just need to display thumbnails in UI

// app/features/documents/components/DocumentCard.tsx
export function DocumentCard({ document }: { document: Document }) {
  const thumbnailUrl = document.thumbnailS3Key
    ? `/api/storage/thumbnail/${document.id}`
    : '/default-pdf-icon.png';

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="h-48 bg-gray-100 flex items-center justify-center">
        <img
          src={thumbnailUrl}
          alt={document.name}
          className="max-h-full max-w-full object-contain"
          onError={(e) => {
            e.currentTarget.src = '/default-pdf-icon.png';
          }}
        />
      </div>
      {/* Rest of card */}
    </div>
  );
}

// Thumbnail download endpoint
// app/routes/api.storage.thumbnail.$documentId.tsx
export async function loader({ request, params }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  const { documentId } = params;

  const document = await db.query.documents.findFirst({
    where: and(
      eq(documents.id, documentId),
      eq(documents.userId, user.id)
    ),
  });

  if (!document || !document.thumbnailS3Key) {
    throw new Response('Not Found', { status: 404 });
  }

  // Generate presigned URL for thumbnail
  const thumbnailUrl = await generateDownloadPresignedUrl(
    document.thumbnailS3Key,
    3600 // 1 hour
  );

  return redirect(thumbnailUrl);
}
```

**우선순위**: High
**예상 작업량**: 0.5일 (SPEC 006 구현에 포함)

---

## 2. 사용자 경험 개선

### 2.1 Enhanced Error Messages (FR-018)
**상태**: ⚠️ 개선 필요

**요구사항**:
- 업로드 실패 시 구체적인 에러 메시지
- 할당량 초과, 잘못된 파일 형식, 크기 제한, 네트워크 오류 구분

**구현 필요 사항**:

```typescript
// 1. Error Type Definitions
// app/types/upload-errors.ts
export enum UploadErrorType {
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  NETWORK_ERROR = 'NETWORK_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN = 'UNKNOWN',
}

export interface UploadError {
  type: UploadErrorType;
  message: string;
  details?: string;
}

export function getErrorMessage(error: UploadError): string {
  switch (error.type) {
    case UploadErrorType.QUOTA_EXCEEDED:
      return 'Storage quota exceeded. Please delete some files or upgrade your plan.';

    case UploadErrorType.INVALID_FILE_TYPE:
      return `Invalid file type. Only PDF, DOCX, and TXT files are supported. ${error.details || ''}`;

    case UploadErrorType.FILE_TOO_LARGE:
      return `File is too large (max 10MB). Your file: ${error.details || 'unknown size'}.`;

    case UploadErrorType.NETWORK_ERROR:
      return 'Network error. Please check your connection and try again.';

    case UploadErrorType.SERVER_ERROR:
      return `Server error: ${error.details || 'Please try again later'}`;

    default:
      return 'An unexpected error occurred. Please try again.';
  }
}

// 2. Upload Component with Error Handling
// app/features/documents/components/DocumentUpload.tsx
export function DocumentUpload() {
  const [uploadError, setUploadError] = useState<UploadError | null>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFileUpload(file: File) {
    setUploadError(null);
    setUploading(true);

    try {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      if (!allowedTypes.includes(file.type)) {
        throw {
          type: UploadErrorType.INVALID_FILE_TYPE,
          message: 'Invalid file type',
          details: `Got: ${file.type}`,
        };
      }

      // Validate file size
      if (file.size > 10 * 1024 * 1024) {
        throw {
          type: UploadErrorType.FILE_TOO_LARGE,
          message: 'File too large',
          details: formatFileSize(file.size),
        };
      }

      // Request upload URL
      const response = await fetch('/api/storage/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          fileSize: file.size,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();

        if (response.status === 413) {
          throw {
            type: UploadErrorType.QUOTA_EXCEEDED,
            message: errorData.error,
          };
        }

        throw {
          type: UploadErrorType.SERVER_ERROR,
          message: errorData.error,
        };
      }

      const { uploadUrl, documentId } = await response.json();

      // Upload to S3
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw {
          type: UploadErrorType.NETWORK_ERROR,
          message: 'Failed to upload file',
        };
      }

      // Confirm upload
      await fetch('/api/storage/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId }),
      });

      // Success - refresh page
      window.location.reload();

    } catch (error: any) {
      if (error.type) {
        setUploadError(error);
      } else {
        setUploadError({
          type: UploadErrorType.UNKNOWN,
          message: error.message || 'Unknown error',
        });
      }
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      {/* Upload Button */}
      <input
        type="file"
        accept=".pdf,.docx,.txt"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file);
        }}
        disabled={uploading}
      />

      {/* Error Display */}
      {uploadError && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <ExclamationCircleIcon className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-red-900">Upload Failed</h3>
              <p className="text-red-700 mt-1">{getErrorMessage(uploadError)}</p>

              {/* Actionable Suggestions */}
              {uploadError.type === UploadErrorType.QUOTA_EXCEEDED && (
                <div className="mt-3">
                  <Link
                    to="/documents/manage-storage"
                    className="text-sm text-red-800 underline hover:text-red-900"
                  >
                    Manage Storage →
                  </Link>
                </div>
              )}

              {uploadError.type === UploadErrorType.FILE_TOO_LARGE && (
                <p className="text-sm text-red-700 mt-2">
                  Try compressing your file or splitting it into smaller parts.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full" />
            <span className="text-blue-900">Uploading...</span>
          </div>
        </div>
      )}
    </div>
  );
}
```

**우선순위**: High
**예상 작업량**: 0.5일

---

### 2.2 Visual Distinction: Draft vs Final (FR-019)
**상태**: ⚠️ 확인 필요

**요구사항**:
- Draft 문서와 Final 문서의 시각적 구분

**구현 필요 사항**:

```typescript
// app/features/documents/components/DocumentCard.tsx
export function DocumentCard({ document }: { document: Document }) {
  return (
    <div className={`border rounded-lg p-4 ${
      document.versionStatus === 'draft'
        ? 'border-yellow-300 bg-yellow-50'
        : 'border-gray-200 bg-white'
    }`}>
      {/* Status Badge */}
      <div className="flex items-center justify-between mb-2">
        <span
          className={`px-2 py-1 text-xs font-medium rounded ${
            document.versionStatus === 'draft'
              ? 'bg-yellow-200 text-yellow-800'
              : 'bg-green-200 text-green-800'
          }`}
        >
          {document.versionStatus === 'draft' ? 'Draft' : 'Final'}
        </span>

        {/* Document Type */}
        <span className="text-xs text-gray-500">{document.type}</span>
      </div>

      {/* Thumbnail & Info */}
      <img src={document.thumbnailUrl} alt={document.name} />
      <h3>{document.name}</h3>

      {/* Draft Warning */}
      {document.versionStatus === 'draft' && (
        <p className="text-xs text-yellow-700 mt-2">
          This is a draft version. Mark as final when ready.
        </p>
      )}
    </div>
  );
}
```

**우선순위**: Medium
**예상 작업량**: 0.25일

---

### 2.3 Default Ordering (FR-020)
**상태**: ⚠️ 확인 필요

**요구사항**:
- 기본 정렬: 업로드 날짜 (최신순)

**구현 검증**:

```typescript
// app/routes/documents.tsx
export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);

  const documents = await db.query.documents.findMany({
    where: and(
      eq(documents.userId, user.id),
      eq(documents.status, 'uploaded')
    ),
    orderBy: (documents, { desc }) => [desc(documents.uploadedAt)], // Ensure this
  });

  return json({ documents });
}
```

**우선순위**: Low
**예상 작업량**: 0.1일 (검증만)

---

## 3. 기능 개선

### 3.1 Download Count Display
**상태**: ⚠️ UI 미확인

**요구사항**:
- 문서 카드에 다운로드 횟수 표시

**구현 필요 사항**:

```typescript
// app/features/documents/components/DocumentCard.tsx
export function DocumentCard({ document }: { document: Document }) {
  return (
    <div className="border rounded-lg p-4">
      {/* ... existing code */}

      {/* Metadata */}
      <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
        <span>{formatFileSize(document.size)}</span>
        <span>•</span>
        <span className="flex items-center gap-1">
          <ArrowDownTrayIcon className="h-4 w-4" />
          {document.downloadCount} downloads
        </span>
        <span>•</span>
        <span>{formatDate(document.uploadedAt)}</span>
      </div>
    </div>
  );
}
```

**우선순위**: Medium
**예상 작업량**: 0.1일

---

### 3.2 Bulk Actions
**상태**: ❌ 미구현 (추가 기능)

**추가 제안**:
- 여러 문서 선택하여 일괄 삭제
- 일괄 다운로드 (ZIP)

**구현 필요 사항**:

```typescript
// app/features/documents/components/DocumentGrid.tsx
export function DocumentGrid() {
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);

  function toggleSelection(documentId: string) {
    setSelectedDocs((prev) => {
      const next = new Set(prev);
      if (next.has(documentId)) {
        next.delete(documentId);
      } else {
        next.add(documentId);
      }
      return next;
    });
  }

  async function bulkDelete() {
    if (!confirm(`Delete ${selectedDocs.size} documents?`)) return;

    await Promise.all(
      Array.from(selectedDocs).map((id) =>
        fetch(`/api/storage/delete/${id}`, { method: 'DELETE' })
      )
    );

    window.location.reload();
  }

  return (
    <div>
      {/* Selection Mode Toggle */}
      <div className="flex justify-between mb-4">
        <h2>My Documents</h2>
        <button
          onClick={() => {
            setSelectionMode(!selectionMode);
            setSelectedDocs(new Set());
          }}
          className="px-4 py-2 border rounded"
        >
          {selectionMode ? 'Cancel' : 'Select'}
        </button>
      </div>

      {/* Bulk Actions Bar */}
      {selectionMode && selectedDocs.size > 0 && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded flex items-center justify-between">
          <span className="text-blue-900">
            {selectedDocs.size} document{selectedDocs.size > 1 ? 's' : ''} selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={bulkDelete}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Document Grid */}
      <div className="grid grid-cols-3 gap-4">
        {documents.map((doc) => (
          <DocumentCard
            key={doc.id}
            document={doc}
            selectionMode={selectionMode}
            isSelected={selectedDocs.has(doc.id)}
            onToggleSelection={() => toggleSelection(doc.id)}
          />
        ))}
      </div>
    </div>
  );
}

// Update DocumentCard
export function DocumentCard({
  document,
  selectionMode,
  isSelected,
  onToggleSelection,
}: DocumentCardProps) {
  return (
    <div
      className={`border rounded-lg p-4 ${
        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
      }`}
      onClick={() => selectionMode && onToggleSelection()}
    >
      {/* Selection Checkbox */}
      {selectionMode && (
        <div className="absolute top-2 right-2">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggleSelection}
            className="h-5 w-5"
          />
        </div>
      )}

      {/* ... rest of card */}
    </div>
  );
}
```

**우선순위**: Low (Nice to have)
**예상 작업량**: 1일

---

## 4. 구현 우선순위 요약

### Critical (즉시 구현)
1. ✅ **Built-in PDF Viewer (1.1)** - UX BLOCKING

### High Priority
1. PDF Thumbnail Preview (1.2) - SPEC 006 포함
2. Enhanced Error Messages (2.1)

### Medium Priority
1. Visual Distinction: Draft vs Final (2.2)
2. Download Count Display (3.1)

### Low Priority
1. Default Ordering Verification (2.3)
2. Bulk Actions (3.2)

---

## 5. 테스트 계획

```typescript
describe('Document Management', () => {
  it('should display PDF viewer when clicking view button', async () => {
    const document = await createDocument({ type: 'application/pdf' });

    render(<DocumentGrid documents={[document]} />);

    const viewButton = screen.getByText('View');
    fireEvent.click(viewButton);

    expect(screen.getByText('Page 1 of')).toBeInTheDocument();
  });

  it('should show error message for invalid file type', async () => {
    render(<DocumentUpload />);

    const file = new File(['content'], 'test.exe', { type: 'application/x-msdownload' });
    const input = screen.getByLabelText('Upload Document');

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText(/Invalid file type/)).toBeInTheDocument();
    });
  });

  it('should show error message for quota exceeded', async () => {
    const user = await createUserWithStorageUsage(98 * 1024 * 1024);

    render(<DocumentUpload />);

    const file = new File(['x'.repeat(5 * 1024 * 1024)], 'large.pdf', {
      type: 'application/pdf',
    });

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText(/Storage quota exceeded/)).toBeInTheDocument();
      expect(screen.getByText('Manage Storage')).toBeInTheDocument();
    });
  });

  it('should visually distinguish draft and final documents', () => {
    const draftDoc = createDocument({ versionStatus: 'draft' });
    const finalDoc = createDocument({ versionStatus: 'final' });

    const { container } = render(
      <DocumentGrid documents={[draftDoc, finalDoc]} />
    );

    const draftCard = container.querySelector('[data-status="draft"]');
    const finalCard = container.querySelector('[data-status="final"]');

    expect(draftCard).toHaveClass('border-yellow-300');
    expect(finalCard).toHaveClass('border-gray-200');
  });
});
```

---

## 6. 성능 최적화

### 6.1 Lazy Loading for PDF Viewer
**구현 필요 사항**:

```typescript
// Lazy load PDF viewer to reduce initial bundle size
import { lazy, Suspense } from 'react';

const PDFViewer = lazy(() => import('./PDFViewer'));

export function DocumentGrid() {
  return (
    <>
      {viewingDocument && (
        <Suspense fallback={<LoadingSpinner />}>
          <PDFViewer
            documentUrl={viewingDocument.url}
            filename={viewingDocument.name}
            onClose={() => setViewingDocument(null)}
          />
        </Suspense>
      )}
    </>
  );
}
```

### 6.2 Pagination for Large Document Lists
**구현 필요 사항**:

```typescript
// app/routes/documents.tsx
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const page = Number(url.searchParams.get('page')) || 1;
  const pageSize = 20;

  const offset = (page - 1) * pageSize;

  const [documents, totalCount] = await Promise.all([
    db.query.documents.findMany({
      where: eq(documents.userId, user.id),
      limit: pageSize,
      offset,
      orderBy: (documents, { desc }) => [desc(documents.uploadedAt)],
    }),
    db
      .select({ count: count() })
      .from(documents)
      .where(eq(documents.userId, user.id)),
  ]);

  return json({
    documents,
    pagination: {
      page,
      pageSize,
      totalCount: totalCount[0].count,
      totalPages: Math.ceil(totalCount[0].count / pageSize),
    },
  });
}
```

---

## 7. 접근성 개선

### 7.1 Keyboard Navigation for PDF Viewer
이미 구현됨 (1.1의 Keyboard Shortcuts 참조)

### 7.2 Screen Reader Support
```typescript
// Add ARIA labels
<button
  onClick={zoomIn}
  aria-label="Zoom in"
  className="..."
>
  +
</button>

<button
  onClick={goToNextPage}
  aria-label={`Go to next page (${pageNumber + 1} of ${numPages})`}
  disabled={pageNumber >= numPages}
>
  →
</button>
```

---

## 8. 참고 문서

- [react-pdf Documentation](https://github.com/wojtekmaj/react-pdf)
- [PDF.js API](https://mozilla.github.io/pdf.js/api/)
- [File Upload UX Best Practices](https://www.nngroup.com/articles/file-upload-ui/)
