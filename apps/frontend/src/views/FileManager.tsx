import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FileItem } from '@yare/types';
import { formatBytes } from '@yare/utils';
import {
  Folder,
  FileText,
  FileCode,
  FileImage,
  Upload,
  FolderPlus,
  FilePlus,
  Trash2,
  Edit3,
  Archive,
  Download,
  ChevronRight,
  Shield,
  X,
  Save,
  Grid,
  List
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
        setCurrentPath(res.data.currentPath);
        setItems(res.data.items);
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
        setFileContent(res.data.content);
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

  // Breadcrumbs path rendering
  const pathParts = currentPath.split('/').filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Top Toolbar */}
      <div className="glass-panel rounded-2xl border border-slate-800 bg-slate-900/60 p-4 flex flex-wrap items-center justify-between gap-4">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-1.5 text-xs font-semibold overflow-x-auto py-1">
          <button
            onClick={() => setCurrentPath('/')}
            className="text-cyan-400 hover:underline px-1.5 py-1 rounded hover:bg-slate-800"
          >
            root
          </button>
          {pathParts.map((part, idx) => {
            const subPath = '/' + pathParts.slice(0, idx + 1).join('/');
            return (
              <React.Fragment key={idx}>
                <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
                <button
                  onClick={() => setCurrentPath(subPath)}
                  className="text-slate-200 hover:text-white px-1.5 py-1 rounded hover:bg-slate-800"
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
            className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:border-slate-700 transition-all"
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
            className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:border-slate-700 transition-all"
          >
            <FilePlus className="h-3.5 w-3.5 text-indigo-400" /> New File
          </button>

          <div className="h-5 w-px bg-slate-800 mx-1" />

          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-lg ${viewMode === 'list' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <List className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg ${viewMode === 'grid' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <Grid className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main File Browser */}
      {viewMode === 'list' ? (
        <div className="glass-panel rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="border-b border-slate-800 bg-slate-950/80 uppercase text-[10px] text-slate-400">
              <tr>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Size</th>
                <th className="py-3 px-4">Permissions</th>
                <th className="py-3 px-4">Owner/Group</th>
                <th className="py-3 px-4">Modified</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {items.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
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
                      className="hover:text-cyan-300 text-slate-200 text-xs font-semibold"
                    >
                      {item.name}
                    </button>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400">{item.isDir ? '-' : formatBytes(item.size, 1)}</td>
                  <td className="py-3 px-4 font-mono text-cyan-400/90">{item.permissions}</td>
                  <td className="py-3 px-4 text-slate-400">{item.owner}:{item.group}</td>
                  <td className="py-3 px-4 text-slate-400">{item.modTime}</td>
                  <td className="py-3 px-4 text-right space-x-1">
                    {!item.isDir && (
                      <button onClick={() => handleOpenEdit(item)} className="p-1 text-slate-400 hover:text-cyan-400">
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setChmodTarget(item);
                        setChmodOpen(true);
                      }}
                      className="p-1 text-slate-400 hover:text-indigo-400"
                    >
                      <Shield className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => handleDelete(item)} className="p-1 text-slate-400 hover:text-rose-400">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {items.map((item, idx) => (
            <div
              key={idx}
              onClick={() => item.isDir ? setCurrentPath(item.path) : handleOpenEdit(item)}
              className="glass-panel rounded-2xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col items-center text-center cursor-pointer hover:border-cyan-500/40 hover:bg-slate-800/40 transition-all"
            >
              {item.isDir ? (
                <Folder className="h-10 w-10 text-cyan-400 fill-cyan-400/20 mb-2" />
              ) : (
                <FileCode className="h-10 w-10 text-indigo-400 mb-2" />
              )}
              <span className="text-xs font-semibold text-slate-200 truncate w-full">{item.name}</span>
              <span className="text-[10px] text-slate-400 mt-1 font-mono">{item.isDir ? 'Directory' : formatBytes(item.size, 1)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Editor Modal */}
      {editorOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl glass-panel rounded-3xl border border-slate-800 bg-slate-900 p-6 flex flex-col h-[80vh] shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <Edit3 className="h-4 w-4 text-cyan-400" /> {editingFilePath}
              </h3>
              <button onClick={() => setEditorOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <textarea
              value={fileContent}
              onChange={(e) => setFileContent(e.target.value)}
              className="flex-1 w-full bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-200 focus:outline-none focus:border-cyan-500 resize-none"
            />
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800 mt-4">
              <button onClick={() => setEditorOpen(false)} className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800">
                Cancel
              </button>
              <button onClick={handleSaveFile} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400">
                <Save className="h-4 w-4" /> Save File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chmod Permissions Modal */}
      {chmodOpen && chmodTarget && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-panel rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Shield className="h-4 w-4 text-indigo-400" /> Change Permissions: {chmodTarget.name}
            </h3>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Octal Mode (e.g. 0755, 0644)</label>
              <input
                type="text"
                value={newMode}
                onChange={(e) => setNewMode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 font-mono"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setChmodOpen(false)} className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800">
                Cancel
              </button>
              <button onClick={handleSaveChmod} className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500">
                Update Mode
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
