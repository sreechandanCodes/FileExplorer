export interface Entry {
  name: string;
  fullPath: string;
  isDirectory: boolean;
  isSymbolicLink: boolean;
  isHidden: boolean;
  canOpen: boolean;
  size: number;
  createdAt: string;
  modifiedAt: string;
  extension?: string;
  linkTarget?: string | null;
  linkTargetPath?: string | null;
  linkTargetParentPath?: string | null;
  canJumpToTarget?: boolean;
}

export type DirectoryContents = Array<Entry>;

export interface DirectoryInfo {
  path: string;
  rootPath: string;
  parentPath: string | null;
  pathSeparator: string;
}

export interface DirectoryListing extends DirectoryInfo {
  entries: DirectoryContents;
}

export interface BottomBarStatus {
  totalCount: number;
  currentPosition: number;
  folderCount: number;
  fileCount: number;
  canJumpToTarget: boolean;
}
