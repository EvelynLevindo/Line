import React, { useState, useEffect } from 'react';
import { dataService } from '../../services/firebase';
import { storage } from '../../services/storage';
import { useApp } from '../../context/AppContext';
import { 
  Users, 
  MessageCircle, 
  Heart, 
  Plus, 
  EyeOff, 
  X, 
  Sparkles, 
  UserCircle2 
} from 'lucide-react';

export default function CommunityForumTab() {
  const { showToast } = useApp();

  const [posts, setPosts] = useState([]);
  const [hiddenIds, setHiddenIds] = useState(() => storage.getHiddenPostIds());
  const [userNick, setUserNick] = useState(() => {
    return localStorage.getItem('line_user_chosen_nick') || `Anônima_${Math.floor(100 + Math.random() * 900)}`;
  });

  const [isNewPostOpen, setIsNewPostOpen] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Subscribe to real-time shared Firestore forum posts
  useEffect(() => {
    const unsubscribe = dataService.subscribeForumPosts((incomingPosts) => {
      setPosts(incomingPosts || []);
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Save nickname when edited
  const handleUpdateNick = (val) => {
    setUserNick(val);
    try {
      localStorage.setItem('line_user_chosen_nick', val);
    } catch {}
  };

  // Toggle Like in Firestore
  const handleLike = async (postId) => {
    try {
      await dataService.likeForumPost(postId);
    } catch (e) {
      console.warn('Erro ao curtir:', e);
    }
  };

  // Hide post locally
  const handleHidePost = (postId) => {
    const updated = [...hiddenIds, postId];
    setHiddenIds(updated);
    storage.saveHiddenPostIds(updated);
    showToast('Postagem ocultada deste dispositivo.');
  };

  // Publish new post to Firestore
  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!postTitle.trim() || !postContent.trim()) return;

    setIsSubmitting(true);
    try {
      const author = userNick.trim() || 'Anônima';
      await dataService.addForumPost({
        author,
        title: postTitle.trim(),
        content: postContent.trim()
      });

      setPostTitle('');
      setPostContent('');
      setIsNewPostOpen(false);
      showToast('Relato publicado com sucesso no fórum compartilhado!');
    } catch (err) {
      showToast('Erro ao publicar post.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const visiblePosts = posts.filter(p => !hiddenIds.includes(p.id));

  return (
    <div className="flex flex-col w-full pb-6 space-y-3">
      {/* User Custom Anonymous Nickname Header */}
      <div className="bg-white border border-[#ffe8ec] rounded-2xl p-3 shadow-2xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-full bg-[#ffe8ec] text-[#7e001d] font-bold text-xs flex items-center justify-center shrink-0">
            {userNick.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] text-[#5a4040]">Seu Apelido no Fórum</span>
            <input
              type="text"
              value={userNick}
              onChange={(e) => handleUpdateNick(e.target.value)}
              placeholder="Digite seu apelido anônimo"
              className="text-xs font-bold text-[#7e001d] bg-transparent border-b border-[#e2bebe] focus:outline-none focus:border-[#7e001d] pb-0.5 truncate max-w-[170px]"
            />
          </div>
        </div>

        <button
          onClick={() => setIsNewPostOpen(true)}
          className="h-9 px-3 rounded-xl bg-[#7e001d] hover:bg-[#920023] text-white font-bold text-xs flex items-center gap-1.5 active:scale-95 transition-all shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Relato</span>
        </button>
      </div>

      {/* Shared Posts List (Starts clean - zero fake posts!) */}
      {visiblePosts.length === 0 ? (
        <div className="bg-white border border-[#ffe8ec] rounded-3xl p-8 text-center flex flex-col items-center justify-center gap-3 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-[#fff0f2] flex items-center justify-center text-[#7e001d]">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#2e131b]">Fórum Comunitário Anônimo</h3>
            <p className="text-xs text-[#5a4040] mt-1 max-w-[280px] mx-auto leading-relaxed">
              Espaço seguro e compartilhado entre todas as usuárias da plataforma. Compartilhe um desabafo, peça orientações ou apoie outras mulheres.
            </p>
          </div>
          <button
            onClick={() => setIsNewPostOpen(true)}
            className="px-4 py-2 rounded-full bg-[#ffe8ec] hover:bg-[#ffd9e0] text-[#7e001d] text-xs font-bold active:scale-95 transition-all"
          >
            + Publicar Primeiro Relato
          </button>
        </div>
      ) : (
        <div className="space-y-3 pt-1">
          {visiblePosts.map(post => {
            const formattedTime = post.createdAt
              ? new Date(post.createdAt).toLocaleDateString('pt-BR', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit'
                })
              : 'Recente';

            return (
              <div
                key={post.id}
                className="bg-white border border-[#ffe8ec] rounded-3xl p-4 shadow-xs flex flex-col gap-2.5"
              >
                {/* Post Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#fff0f2] text-[#7e001d] font-bold text-xs flex items-center justify-center">
                      {(post.author || 'A').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-[#2e131b]">{post.author}</span>
                      <span className="text-[10px] text-[#8e7070]">{formattedTime}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleHidePost(post.id)}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[#8e7070] hover:text-red-700 active:scale-90"
                    title="Ocultar este relato para você"
                  >
                    <EyeOff className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Title & Body */}
                <h3 className="text-xs font-bold text-[#2e131b]">{post.title}</h3>
                <p className="text-xs text-[#5a4040] leading-relaxed whitespace-pre-line">
                  {post.content}
                </p>

                {/* Footer action: Likes */}
                <div className="flex items-center justify-between pt-2 border-t border-[#ffe8ec] text-xs">
                  <button
                    onClick={() => handleLike(post.id)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-[#5a4040] hover:bg-[#fff0f2] active:scale-95 transition-all"
                  >
                    <Heart className="w-3.5 h-3.5 text-rose-600" />
                    <span>{post.likes || 0} acolhimentos</span>
                  </button>

                  <span className="text-[10px] text-[#8e7070]">
                    Compartilhado anonimamente
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Novo Relato Anônimo */}
      {isNewPostOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-[420px] bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between border-b border-[#ffe8ec] pb-2">
              <div>
                <h3 className="text-sm font-bold text-[#2e131b]">Publicar Relato no Fórum</h3>
                <p className="text-[11px] text-[#5a4040]">Visível para todas as usuárias</p>
              </div>
              <button
                onClick={() => setIsNewPostOpen(false)}
                className="w-8 h-8 rounded-full bg-[#fff0f2] flex items-center justify-center text-[#5a4040]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="flex flex-col gap-3">
              <div>
                <label className="text-[11px] font-bold text-[#5a4040] uppercase">
                  Seu Apelido Anônimo
                </label>
                <input
                  type="text"
                  required
                  value={userNick}
                  onChange={(e) => handleUpdateNick(e.target.value)}
                  placeholder="Ex: FlorDeMaio, Guerreira, Anônima..."
                  className="w-full mt-1 bg-[#fff0f2] border border-[#e2bebe] rounded-xl px-3 py-2 text-xs font-bold text-[#7e001d] focus:outline-none focus:ring-2 focus:ring-[#7e001d]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#5a4040] uppercase">Título</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Como consegui ajuda, Dúvida sobre medida protetiva..."
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  className="w-full mt-1 bg-[#fff0f2] border border-[#e2bebe] rounded-xl px-3 py-2 text-xs text-[#2e131b] focus:outline-none focus:ring-2 focus:ring-[#7e001d]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#5a4040] uppercase">Mensagem</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Escreva sua mensagem com liberdade. Nunca inclua nomes reais, endereços físicos ou informações que identifiquem você..."
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  className="w-full mt-1 bg-[#fff0f2] border border-[#e2bebe] rounded-xl p-3 text-xs text-[#2e131b] focus:outline-none focus:ring-2 focus:ring-[#7e001d]"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-full bg-[#7e001d] hover:bg-[#920023] text-white font-bold text-xs shadow-md active:scale-95 transition-transform disabled:opacity-60"
              >
                {isSubmitting ? 'Publicando...' : 'Publicar Relato Protegido'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
