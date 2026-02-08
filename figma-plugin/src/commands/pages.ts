import type { FigmaCommand, CommandResult } from './types';
import { successResult, errorResult } from './types';

// Create a new page
export async function handleCreatePage(command: FigmaCommand): Promise<CommandResult> {
  var payload = command.payload as {
    name?: string;
    setAsCurrent?: boolean;
  };

  var page = figma.createPage();

  if (payload && payload.name) {
    page.name = payload.name;
  }

  if (payload && payload.setAsCurrent) {
    await figma.setCurrentPageAsync(page);
  }

  return successResult(command.id, {
    data: {
      id: page.id,
      name: page.name,
    },
  });
}

// Delete a page
export async function handleDeletePage(command: FigmaCommand): Promise<CommandResult> {
  var payload = command.payload as {
    pageId?: string;
    pageName?: string;
  };

  if (!payload.pageId && !payload.pageName) {
    return errorResult(command.id, 'Must specify either pageId or pageName');
  }

  var doc = figma.root;
  var targetPage: PageNode | null = null;

  for (var i = 0; i < doc.children.length; i++) {
    var page = doc.children[i];
    if (payload.pageId && page.id === payload.pageId) {
      targetPage = page;
      break;
    }
    if (payload.pageName && page.name === payload.pageName) {
      targetPage = page;
      break;
    }
  }

  if (!targetPage) {
    return errorResult(command.id, 'Page not found');
  }

  // Cannot delete the only page
  if (doc.children.length <= 1) {
    return errorResult(command.id, 'Cannot delete the only page in the document');
  }

  // Cannot delete current page - switch first
  if (targetPage.id === figma.currentPage.id) {
    var newCurrentPage = doc.children.find(function(p) { return p.id !== targetPage!.id; });
    if (newCurrentPage) {
      await figma.setCurrentPageAsync(newCurrentPage);
    }
  }

  var pageName = targetPage.name;
  targetPage.remove();

  return successResult(command.id, {
    data: {
      deleted: true,
      name: pageName,
    },
  });
}

// Rename a page
export async function handleRenamePage(command: FigmaCommand): Promise<CommandResult> {
  var payload = command.payload as {
    pageId?: string;
    pageName?: string;
    newName: string;
  };

  if (!payload.newName) {
    return errorResult(command.id, 'newName is required');
  }

  if (!payload.pageId && !payload.pageName) {
    return errorResult(command.id, 'Must specify either pageId or pageName');
  }

  var doc = figma.root;
  var targetPage: PageNode | null = null;

  for (var i = 0; i < doc.children.length; i++) {
    var page = doc.children[i];
    if (payload.pageId && page.id === payload.pageId) {
      targetPage = page;
      break;
    }
    if (payload.pageName && page.name === payload.pageName) {
      targetPage = page;
      break;
    }
  }

  if (!targetPage) {
    return errorResult(command.id, 'Page not found');
  }

  var oldName = targetPage.name;
  targetPage.name = payload.newName;

  return successResult(command.id, {
    data: {
      id: targetPage.id,
      oldName: oldName,
      newName: targetPage.name,
    },
  });
}

// Duplicate a page
export async function handleDuplicatePage(command: FigmaCommand): Promise<CommandResult> {
  var payload = command.payload as {
    pageId?: string;
    pageName?: string;
    newName?: string;
  };

  if (!payload.pageId && !payload.pageName) {
    return errorResult(command.id, 'Must specify either pageId or pageName');
  }

  var doc = figma.root;
  var targetPage: PageNode | null = null;

  for (var i = 0; i < doc.children.length; i++) {
    var page = doc.children[i];
    if (payload.pageId && page.id === payload.pageId) {
      targetPage = page;
      break;
    }
    if (payload.pageName && page.name === payload.pageName) {
      targetPage = page;
      break;
    }
  }

  if (!targetPage) {
    return errorResult(command.id, 'Page not found');
  }

  // Load the page first
  await targetPage.loadAsync();

  // Create new page and copy children
  var newPage = figma.createPage();
  newPage.name = payload.newName || (targetPage.name + ' (Copy)');

  // Copy all children
  for (var i = 0; i < targetPage.children.length; i++) {
    var child = targetPage.children[i];
    var clone = child.clone();
    newPage.appendChild(clone);
  }

  return successResult(command.id, {
    data: {
      id: newPage.id,
      name: newPage.name,
      childCount: newPage.children.length,
    },
  });
}

// Load all pages (enables accessing children of non-current pages)
export async function handleLoadAllPages(command: FigmaCommand): Promise<CommandResult> {
  await figma.loadAllPagesAsync();

  var doc = figma.root;
  var pages: object[] = [];

  for (var i = 0; i < doc.children.length; i++) {
    var page = doc.children[i];
    pages.push({
      id: page.id,
      name: page.name,
      childCount: page.children.length,
    });
  }

  return successResult(command.id, {
    data: {
      loaded: true,
      pageCount: pages.length,
      pages: pages,
    },
  });
}
