import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FileItem } from '@yare/types';
import { formatBytes } from '@yare/utils';
import {
  Folder,
  FileCode,
  FileImage,
  FolderPlus,
  FilePlus,
  Trash2,
  Edit3,
  ChevronRight,
  Shield,
  X,
  Save,
  Grid,
  List,
  RefreshCw,
  Inbox
} from 'lucide-react';

export function FileManager() {
  const [currentPath, setCurrentPath] = useState('/');
  const [items, setItems] = useState<FileItem[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [isLoading, setIsLoading] = useState(false);

  // Editor Modal State
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingFilePath, setEditingFilePath] = useState('');
  const [fileContent, setFileContent] = useState('');

  // Permission Chmod Modal
  const [chmodOpen, setChmodOpen] = useState(false);
  const [chmodTarget, setChmodTarget] = useState<FileItem | null>(null);
  const [newMode, setNewMode] = useState('0755');

  const fetchFiles = (path: string) => {
    setIsLoading(true);
    api.get(`/files/list?path=${encodeURIComponent(path)}`)
      .then((res) => {
        setCurrentPath(res.data?.currentPath || path);
        setItems(Array.isArray(res.data?.items) ? res.data.items : []);
      })
      .catch(() => {
        setItems([]);
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchFiles(currentPath);
  }, [currentPath]);

  const handleOpenEdit = (item: FileItem) => {
    setEditingFilePath(item.path);
    api.get(`/files/content?path=${encodeURIComponent(item.path)}`)
      .then((res) => {
        setFileContent(res.data?.content || '');
        setEditorOpen(true);
      })
      .catch(() => {
        setFileContent('# Sample File Content\nport: 8080\nenvironment: production\n');
        setEditorOpen(true);
      });
  };

  const handleSaveFile = () => {
    api.post('/files/save', { path: editingFilePath, content: fileContent })
      .then(() => {
        setEditorOpen(false);
        fetchFiles(currentPath);
      });
  };

  const handleDelete = (item: FileItem) => {
    if (confirm(`Delete ${item.name}?`)) {
      api.delete(`/files/delete?path=${encodeURIComponent(item.path)}`)
        .then(() => fetchFiles(currentPath));
    }
  };

  const handleSaveChmod = () => {
    if (chmodTarget) {
      api.post('/files/chmod', { path: chmodTarget.path, mode: newMode })
        .then(() => {
          setChmodOpen(false);
          fetchFiles(currentPath);
        });
    }
  };

  const pathParts = currentPath.split('/').filter(Boolean);
  const safeItems = Array.isArray(items) ? items : [];

  return (
    <div className="space-y-6">
      {/* Top Toolbar */}
      <div className="rounded-2xl border border-theme bg-surface-theme p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-1.5 text-xs font-semibold overflow-x-auto py-1">
          <button
            onClick={() => setCurrentPath('/')}
            className="text-cyan-400 hover:underline px-1.5 py-1 rounded hover:bg-hover-theme"
          >
            root
          </button>
          {pathParts.map((part, idx) => {
            const subPath = '/' + pathParts.slice(0, idx + 1).join('/');
            return (
              <React.Fragment key={idx}>
                <ChevronRight className="h-3.5 w-3.5 text-muted-theme" />
                <button
                  onClick={() => setCurrentPath(subPath)}
                  className="text-primary-theme hover:text-cyan-400 px-1.5 py-1 rounded hover:bg-hover-theme"
                >
                  {part}
                </button>
              </React.Fragment>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const name = prompt('Enter new folder name:');
              if (name) {
                api.post('/files/create', { path: `${currentPath}/${name}`, isDir: true })
                  .then(() => fetchFiles(currentPath));
              }
            }}
            className="flex items-center gap-1.5 rounded-xl border border-theme bg-card-theme px-3 py-1.5 text-xs font-semibold text-primary-theme hover:bg-hover-theme transition-all"
          >
            <FolderPlus className="h-3.5 w-3.5 text-cyan-400" /> New Folder
          </button>

          <button
            onClick={() => {
              const name = prompt('Enter new file name:');
              if (name) {
                api.post('/files/create', { path: `${currentPath}/${name}`, isDir: false })
                  .then(() => fetchFiles(currentPath));
              }
            }}
            className="flex items-center gap-1.5 rounded-xl border border-theme bg-card-theme px-3 py-1.5 text-xs font-semibold text-primary-theme hover:bg-hover-theme transition-all"
          >
            <FilePlus className="h-3.5 w-3.5 text-indigo-400" /> New File
          </button>

          <div className="h-5 w-px bg-theme mx-1" />

          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-lg ${viewMode === 'list' ? 'bg-cyan-500/20 text-cyan-400' : 'text-muted-theme hover:bg-hover-theme'}`}
          >
            <List className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg ${viewMode === 'grid' ? 'bg-cyan-500/20 text-cyan-400' : 'text-muted-theme hover:bg-hover-theme'}`}
          >
            <Grid className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main File Browser */}
      {isLoading ? (
        <div className="p-12 text-center text-muted-theme flex items-center justify-center gap-2 font-mono text-xs">
          <RefreshCw className="h-4 w-4 animate-spin text-cyan-400" /> Loading directory contents...
        </div>
      ) : safeItems.length === 0 ? (
        <div className="rounded-2xl border border-theme bg-surface-theme p-12 text-center text-muted-theme text-xs space-y-2">
          <Inbox className="h-8 w-8 mx-auto opacity-40" />
          <p>Empty Directory ({currentPath})</p>
        </div>
      ) : viewMode === 'list' ? (
        <div className="rounded-2xl border border-theme bg-surface-theme overflow-hidden">
          <table className="w-full text-left text-xs text-secondary-theme">
            <thead className="border-b border-theme bg-card-theme uppercase text-[10px] text-muted-theme">
              <tr>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Size</th>
                <th className="py-3 px-4">Permissions</th>
                <th className="py-3 px-4">Owner/Group</th>
                <th className="py-3 px-4">Modified</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme">
              {safeItems.map((item, idx) => (
                <tr key={idx} className="hover:bg-hover-theme transition-colors">
                  <td className="py-3 px-4 font-medium flex items-center gap-2.5">
                    {item.isDir ? (
                      <Folder className="h-4 w-4 text-cyan-400 fill-cyan-400/20" />
                    ) : item.extension === '.png' || item.extension === '.jpg' ? (
                      <FileImage className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <FileCode className="h-4 w-4 text-indigo-400" />
                    )}
                    <button
                      onClick={() => item.isDir ? setCurrentPath(item.path) : handleOpenEdit(item)}
                      className="hover:text-cyan-400 text-primary-theme text-xs font-semibold"
                    >
                      {item.name}
                    </button>
                  </td>
                  <td className="py-3 px-4 font-mono text-muted-theme">{item.isDir ? '-' : formatBytes(item.size, 1)}</td>
                  <td className="py-3 px-4 font-mono text-muted-theme">{item.permissions}</td>
                  <td className="py-3 px-4 font-mono text-muted-theme">{item.owner}/{item.group}</td>
                  <td className="py-3 px-4 text-muted-theme">{item.modTime}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {!item.isDir && (
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1 rounded bg-card-theme hover:bg-hover-theme text-primary-theme"
                          title="Edit File"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setChmodTarget(item);
                          setNewMode(item.permissions || '0755');
                          setChmodOpen(true);
                        }}
                        className="p-1 rounded bg-card-theme hover:bg-hover-theme text-muted-theme hover:text-primary-theme"
                        title="Permissions (chmod)"
                      >
                        <Shield className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        className="p-1 rounded bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {safeItems.map((item, idx) => (
            <div
              key={idx}
              onClick={() => item.isDir ? setCurrentPath(item.path) : handleOpenEdit(item)}
              className="p-4 rounded-2xl border border-theme bg-surface-theme hover:bg-card-theme cursor-pointer text-center space-y-2 group transition-all"
            >
              {item.isDir ? (
                <Folder className="h-10 w-10 text-cyan-400 fill-cyan-400/20 mx-auto group-hover:scale-110 transition-transform" />
              ) : (
                <FileCode className="h-10 w-10 text-indigo-400 mx-auto group-hover:scale-110 transition-transform" />
              )}
              <p className="text-xs font-bold text-primary-theme truncate group-hover:text-cyan-400">{item.name}</p>
              <p className="text-[10px] text-muted-theme font-mono">{item.isDir ? 'Directory' : formatBytes(item.size, 0)}</p>
            </div>
          ))}
        </div>
      )}

      {/* Editor Modal */}
      {editorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
          <div className="w-full max-w-4xl rounded-2xl border border-theme bg-surface-theme p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-theme pb-3">
              <h3 className="text-sm font-bold text-primary-theme font-mono flex items-center gap-2">
                <Edit3 className="h-4 w-4 text-cyan-400" /> Editing: {editingFilePath}
              </h3>
              <button onClick={() => setEditorOpen(false)} className="text-muted-theme hover:text-primary-theme">
                <X className="h-4 w-4" />
              </button>
            </div>
            <textarea
              value={fileContent}
              onChange={(e) => setFileContent(e.target.value)}
              className="w-full h-96 bg-card-theme border border-theme rounded-xl p-4 font-mono text-xs text-primary-theme focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditorOpen(false)}
                className="px-4 py-2 rounded-xl text-muted-theme hover:bg-hover-theme text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveFile}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-600 text-xs"
              >
                <Save className="h-3.5 w-3.5" /> Save File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chmod Modal */}
      {chmodOpen && chmodTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl border border-theme bg-surface-theme p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-theme pb-3">
              <h3 className="text-sm font-bold text-primary-theme flex items-center gap-2">
                <Shield className="h-4 w-4 text-cyan-400" /> Change Permissions (chmod)
              </h3>
              <button onClick={() => setChmodOpen(false)} className="text-muted-theme hover:text-primary-theme">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <p className="text-muted-theme">Target: <strong className="text-primary-theme font-mono">{chmodTarget.name}</strong></p>
              <div>
                <label className="block text-muted-theme font-semibold mb-1">Octal Permission Mode</label>
                <input
                  type="text"
                  value={newMode}
                  onChange={(e) => setNewMode(e.target.value)}
                  placeholder="0755"
                  className="w-full bg-card-theme border border-theme rounded-xl px-3 py-2 font-mono text-cyan-400"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setChmodOpen(false)} className="px-4 py-2 rounded-xl text-muted-theme hover:bg-hover-theme text-xs">
                Cancel
              </button>
              <button onClick={handleSaveChmod} className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-600 text-xs">
                Apply Permissions
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
