/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/modules/videoPlayer/js/playlistCards.mjs (1)
 # Drop-in Lit web component for J1 Module videoPlayer
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2026 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # -----------------------------------------------------------------------------
*/

// =============================================================================
// Design notes
// -----------------------------------------------------------------------------
// * Renders into LIGHT DOM (createRenderRoot returns `this`) so the existing
//   global rules in skipad.css (.playlist-card, .playlist-thumb-wrapper, etc.)
//   apply unchanged.
// * Sets `display: contents` on the host so the parent's
//   `.playlist.card-mode { display: grid; grid-template-columns: repeat(N,1fr) }`
//   continues to treat each .playlist-card as a direct grid item — the
//   component is layout-transparent.
// * Existing event delegation on #playlistHistory (initRateHandler,
//   initEditHandler, initDeleteHandler, initPlayHandler) still works because
//   clicks bubble up through the light DOM exactly as before.
// * Keyed by videoId via the `repeat` directive — sorting, filtering and
//   incremental updates (rate change, delete one entry) touch only the
//   affected card's DOM, not the whole grid.
// =============================================================================

// Lit browser-loads
//
import { LitElement, html, nothing } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';
import { repeat }                    from 'https://cdn.jsdelivr.net/npm/lit@3/directives/repeat.js/+esm';
import { classMap }                  from 'https://cdn.jsdelivr.net/npm/lit@3/directives/class-map.js/+esm';

// claude - Extend J1 VideoPlayer #3
// DEFAULT_POSTER mirrors the constant in videoPlayer.js so this component
// can resolve the fallback poster independently of the main module.
const DEFAULT_POSTER = '/assets/image/icon/videojs/videojs-poster.png';

// claude - Extend J1 VideoPlayer #4
// YOUTUBE_POSTER_QUALITY defines the YouTube thumbnail quality used when
// back-filling posters for entries loaded from an existing playlist.
// "maxresdefault" matches the value set in videoPlayer.yml
// (players.youtube.poster: maxresdefault.jpg).
const YOUTUBE_POSTER_QUALITY = 'maxresdefault';

// youtube video-id patterns — same regex used in the videoPlayer module.
const YOUTUBE_ID_RE = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([A-Za-z0-9_-]{11})/;

export class PlaylistCards extends LitElement {

  // ---- light DOM rendering --------------------------------------------------
  // Render directly into the host element so skipad.css selectors and the
  // existing click-delegation on #playlistHistory keep working. Shadow DOM
  // would isolate the cards and break both.
  createRenderRoot() {
    return this;
  }

  // ---- reactive properties --------------------------------------------------
  static properties = {
    // Pre-sorted, pre-filtered playlist data. Assigned from
    // renderCards() as `el.entries = [...data]`.
    // attribute: false because this is a complex value, not a string.
    entries: { attribute: false },
  };

  constructor() {
    super();
    /** @type {Array<Object>} */
    this.entries = [];
  }

  connectedCallback() {
    super.connectedCallback();
    // Layout-transparent so the parent CSS grid sees .playlist-card
    // as direct children rather than as descendants of this host.
    this.style.display = 'contents';
  }

  // ---- pure formatting helpers ----------------------------------------------
  // Mirror the playlistManager helpers so the component is self-contained.

  _formatDuration(seconds) {
    if (!seconds || seconds <= 0) return '';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) {
      return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  _getTimeAgo(date) {
    const diff   = Date.now() - date.getTime();
    const mins   = Math.floor(diff / 60000);
    const hours  = Math.floor(diff / 3600000);
    const days   = Math.floor(diff / 86400000);
    const weeks  = Math.floor(days / 7);
    const months = Math.floor(days / 30);

    if (mins  < 1)  return 'Just now';
    if (mins  < 60) return `${mins} minute${mins > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days  < 7)  return `${days} day${days > 1 ? 's' : ''} ago`;
    if (weeks < 5)  return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    return `${months} month${months > 1 ? 's' : ''} ago`;
  }

  // ---- claude - Extend J1 VideoPlayer #4 ------------------------------------
  // _resolvedPoster(v)
  // Returns the best available poster URL for a playlist entry.
  //
  // Problem: entries loaded from an existing playlist (localStorage / server
  // JSON) were saved before fix #3 introduced the `poster` field, or were
  // saved with a stale thumbnail (mqdefault / empty). When these entries are
  // rendered on load the card shows DEFAULT_POSTER instead of the proper
  // YouTube thumbnail.
  //
  // Resolution order:
  //   1. v.poster — already set and does not look like the generic fallback
  //      → use it unchanged (covers native video entries and YouTube entries
  //      that were already back-filled by doPostOnPlaying during a previous
  //      session that saved the updated entry back to storage).
  //   2. v.videoId contains a bare 11-char YouTube ID, OR v.url / v.source
  //      matches the YouTube URL pattern  → derive maxresdefault.jpg from the
  //      YouTube image CDN.  This handles all entries in existing playlists
  //      regardless of when they were saved.
  //   3. Fallback to DEFAULT_POSTER.
  //
  // The returned URL is used only for rendering; v.poster is NOT mutated here.
  // Persistent back-filling (so re-renders after sort/search also use the
  // correct poster) is done by playlistPosterRepairHandler in videoPlayer.js.
  // ---------------------------------------------------------------------------
  _resolvedPoster(v) {
    // 1. Already have a non-fallback poster — use it.
    if (v.poster && v.poster !== DEFAULT_POSTER) {
      return v.poster;
    }

    // 2. Try to derive a YouTube poster from videoId or url/source.
    let ytId = null;

    // 2a. v.videoId — the module stores the bare YouTube video-id here for
    //     YouTube entries (set by extractYouTubeId / doPostOnPlaying).
    if (v.videoId && /^[A-Za-z0-9_-]{11}$/.test(v.videoId)) {
      ytId = v.videoId;
    }

    // 2b. Fall back to scanning v.url or v.source for the video-id.
    if (!ytId) {
      const candidate = v.url || v.source || '';
      const m = candidate.match(YOUTUBE_ID_RE);
      if (m) ytId = m[1];
    }

    if (ytId) {
      return `https://img.youtube.com/vi/${ytId}/${YOUTUBE_POSTER_QUALITY}.jpg`;
    }

    // 3. Generic fallback.
    return DEFAULT_POSTER;
  }

  _isValidUrl(str) {
    if (!str || typeof str !== 'string') return false;
    try {
      const u = new URL(str);
      return u.protocol === 'http:' || u.protocol === 'https:';
    } catch (_) {
      return false;
    }
  }

  // ---- claude - Fix J1 VideoPlayer #4 --------------------------------------
  // Inline click handlers for the two actions that are wired on the adapter
  // side via addEventListener on #playlistHistory (videoPlayer.js initHandlers,
  // steps 2a / 2b).  Both dispatch a CustomEvent that bubbles through the light
  // DOM; the adapter's event listeners catch them and forward to the module's
  // loadAndPlay() / deleteEntry() API.
  //
  // Note: #3 added these dispatchers correctly but wired the adapter side
  // incorrectly (new videoPlayer.initPlayHandler / new videoPlayer.initDeleteHandler
  // — neither is a constructor class). #4 fixes the adapter wiring; no changes
  // are required to the dispatch logic below.
  // ---- play overlay ---------------------------------------------------------
  _onPlayClick(e, videoId) {
    e.stopPropagation();
    this.dispatchEvent(new CustomEvent('playlist-play', {
      bubbles:  true,
      composed: false,        // light DOM — stays in the document tree
      detail:   { videoId }
    }));
  }

  // ---- delete button --------------------------------------------------------
  _onDeleteClick(e, videoId) {
    e.stopPropagation();
    this.dispatchEvent(new CustomEvent('playlist-delete', {
      bubbles:  true,
      composed: false,
      detail:   { videoId }
    }));
  }

  // ---- per-card template ----------------------------------------------------
  // Mirrors the markup from the original renderCards() one-to-one so existing
  // CSS and event delegation match without any other code changes.
  _cardTemplate(v) {
    const duration    = this._formatDuration(v.duration);
    const hasAuthor   = v.author && v.author.trim().length > 0;
    const timeAgo     = this._getTimeAgo(new Date(v.watchDate));
    const rating      = Number(v.rating) || 0;
    const hasRating   = rating > 0;
    const hasInfoLink = this._isValidUrl(v.infoLink);

    const rateBtnClasses = {
      'playlist-btn': true,
      'rate':         true,
      'rated':        hasRating,
    };

    // Text interpolations like ${v.title} and ${v.author} are auto-escaped
    // by Lit — _escapeHtml is no longer needed.
    return html`
      <div class="playlist-card card-base" data-video-id=${v.videoId}>

        <div class="playlist-thumb-wrapper">
          <!-- claude - Extend J1 VideoPlayer #4
               Use _resolvedPoster() so that YouTube entries loaded from an
               existing playlist (where v.poster may be absent or stale) always
               show maxresdefault.jpg. The previous v.poster || DEFAULT_POSTER
               only worked for newly-added entries; loaded entries showed the
               generic fallback icon. -->
          <img class="playlist-thumb"
               src=${this._resolvedPoster(v)}
               alt="playlist-thumb">
          <!-- claude - Fix J1 VideoPlayer #3: @click was missing — overlay did nothing -->
          <div class="playlist-play-overlay"
               @click=${(e) => this._onPlayClick(e, v.videoId)}>
            <i class="fas fa-play"></i>
          </div>
          ${duration
            ? html`<div class="playlist-duration">${duration}</div>`
            : nothing}
          ${hasRating
            ? html`
                <div class="playlist-rating">
                  ${Array.from({ length: rating }, () =>
                    html`<i class="fas fa-star"></i>`)}
                </div>`
            : nothing}
        </div>

        <div class="playlist-info">
          <div class="playlist-title">
            ${v.title}
            ${hasInfoLink
              ? html`
                  <a class="playlist-info-link"
                     href=${v.infoLink}
                     target="_blank"
                     rel="noopener noreferrer"
                     title="More info">
                    <i class="fas fa-info-circle"></i>
                  </a>`
              : nothing}
          </div>

          ${hasAuthor
            ? html`<div class="playlist-author">${v.author}</div>`
            : nothing}

          <div class="playlist-time-info">${timeAgo}</div>

          <div class="playlist-card-actions">
            <!-- bs modal: opened programmatically by initRateHandler -->
            <button class=${classMap(rateBtnClasses)}
                    title=${`Set rating${hasRating ? ` (${rating}/5)` : ''}`}
                    aria-label="Set rating">
              <i class="fas fa-star"></i>
            </button>
            <button class="playlist-btn edit"
                    title="Edit item"
                    aria-label="Edit item">
              <i class="fas fa-edit"></i>
            </button>
            <!-- claude - Fix J1 VideoPlayer #3: @click was missing — delete button did nothing -->
            <button class="playlist-btn delete"
                    title="Delete from playlist"
                    aria-label="Delete from playlist"
                    @click=${(e) => this._onDeleteClick(e, v.videoId)}>
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // ---- root template --------------------------------------------------------
  render() {
    // guard against entries being null/undefined (defensive — callers in
    // skipad.js always assign an array, but a future caller might not).
    const items = Array.isArray(this.entries) ? this.entries : [];

    // wrap the repeat() directive in an html`` template. Returning a bare
    // directive from render() works in Lit 3 but is not the documented
    // contract; the html`` wrapper makes the template result explicit and
    // future-proof across Lit versions. Keyed by videoId — efficient
    // incremental updates on sort/filter/edit.
    return html`${repeat(
      items,
      v => v.videoId,
      v => this._cardTemplate(v),
    )}`;
  }
}

customElements.define('playlist-cards', PlaylistCards);