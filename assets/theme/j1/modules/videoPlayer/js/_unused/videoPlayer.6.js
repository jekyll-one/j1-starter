/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/modules/videoPlayer/js/videoPlayer.js (6)
 # Provides JS Core for J1 Module videoPlayer
 # Extend J1 VideoPlayer #1
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

/* Version 3.1.6 for J1 Template */

// -----------------------------------------------------------------------------
// ESLint shimming
// -----------------------------------------------------------------------------
/* eslint indent: "off"                                                       */
// -----------------------------------------------------------------------------

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);              // AMD: let the loader call factory
  } else if (typeof exports === 'object') {
    module.exports = factory();       // CommonJS: call factory, export result
  } else {
    // Renamed global export from skipAd → videoPlayer.
    root['videoPlayer'] = factory();  // Browser global: call factory, assign result
  }
}(this, function () {
  "use strict";

  // ---------------------------------------------------------------------------
  // Constants
  // MODULE_NAME renamed from 'skipad.core' to 'videoPlayer.core'.
  // ---------------------------------------------------------------------------

  const MODULE_NAME         = 'videoPlayer.core';
  const PASTE_DELAY         = 10;
  const VIDEO_START_DELAY   = 250;

  // Extend J1 VideoPlayer #1
  // Re-added YOUTUBE_PATTERNS so that YouTube URLs are recognised and
  // routed to the YouTube tech path (identical to skipad.js).
  const YOUTUBE_PATTERNS = Object.freeze([
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/
  ]);

  const YOUTUBE_ID_RE = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([A-Za-z0-9_-]{11})/;
  const YOUTUBE_POSTER_QUALITY = 'mqdefault';

  // VIDEO_URL_PATTERNS matches local paths (/assets/...) and remote URLs
  // for MP4, WebM, OGV, OGG, M4V and MOV video files.  A bare filename
  // (no directory) with a recognised extension is also accepted.
  const VIDEO_URL_PATTERNS = Object.freeze([
    // remote URL with a video file extension
    /^https?:\/\/.+\.(?:mp4|webm|og[gv]|m4v|mov)(?:[?#].*)?$/i,
    // absolute local path (starts with /) with a video file extension
    /^\/[^?#]+\.(?:mp4|webm|og[gv]|m4v|mov)(?:[?#].*)?$/i,
    // bare filename (no slash) with a video file extension – relative paths
    /^[^/][^?#]*\.(?:mp4|webm|og[gv]|m4v|mov)(?:[?#].*)?$/i
  ]);

  // Default poster image used when a playlist entry has no poster URL.
  const DEFAULT_POSTER = '/assets/image/icon/videojs/videojs-poster.png';

  const MESSAGES = Object.freeze({
    NO_CLIPBOARD_API:   'Clipboard API not available. Please use Ctrl+V.',
    CLIPBOARD_DENIED:   'Clipboard access failed. Please paste URL manually.',
    // Extend J1 VideoPlayer #1
    // Updated error message: references both YouTube URLs and local video files.
    INVALID_URL:        'Invalid URL. Accepted: YouTube URL/ID or local video path (MP4, WebM, OGV).',
    NO_URL:             'No URL entered.',
    VIDEO_EXISTS:       'Video|Player already exists.',
    LOADING_VIDEO:      'Loading video.'
  });

  // vjsStateEventMap / vjsStateEventNameMap retain the same numeric codes
  // because video.js native HTML5 tech fires the same event names as the
  // YouTube tech did (loadstart, ended, playing, pause, waiting).
  const vjsStateEventMap = {
    'loadstart':        -1,
    'ended':             0,
    'playing':           1,
    'pause':             2,
    'waiting':           3
  };

  const vjsStateEventNameMap = {
    '-1': 'loadstart',
     '0': 'ended',
     '1': 'playing',
     '2': 'paused',
     '3': 'waiting'
  };

  // Pre-defined tags data array
  // ---------------------------------------------------------------------------
  const TAGS_BY_GENRE = Object.freeze({
    'Beauty':             ['beauty', 'makeup', 'skincare', 'hairstyle', 'fashion'],
    'Comedy':             ['comedy', 'standup', 'memes'],
    'Education':          ['education', 'learn', 'tutorial','study'],
    'Entertainment':      [
                           'entertainment', 'infotainment', 'edutainment',
                           'dance', 'show', 'musical', 'tv', 'mixed', 'cinema',
                           'podcast', 'magician', "horror", "ventriloquist",
                           'celebrity', 'series', 'competition', 'audioclip',
                           'videoclip'
                          ],
    'Music':              [
                           'music',  'concert', 'festival', 'cover', 'pop',
                           'k-pop', 'classsic', 'rock', 'folk', 'traditional',
                           'latin', 'jazz', 'rap', 'singer', 'songwriter',
                           'original', 'emotional', 'romantic', '60th', '70th',
                           '80th', '90th', 'remix', 'live'
                          ],
    'Gaming':             ['game', 'gamer'],
    'Howto':              ['howto', 'diy', 'tech', 'mounting', 'cooking', 'food'],
    'Product':            ['product', 'reviews', 'tech', 'unboxing', 'ai', 'programming', 'gadgets'],
    'News':               ['news', 'commentary', 'viral', 'trending' ],
    'Fitness':            ['fitness', 'health', 'sport', 'workout', 'gym', 'health', 'motivation'],
    'Business':           ['business', 'finance', 'tech', 'ai', 'programming', 'gadgets']
  });

  /**
   * _buildGenreOptionHTML - returns the <optgroup> / <option> HTML
   * string for all genres in TAGS_BY_GENRE.
   */
  function _buildGenreOptionHTML() {
    let html = '<option value="">select from common tags</option>\n';
    for (const [genre, tags] of Object.entries(TAGS_BY_GENRE)) {
      html += `                      <optgroup label="${genre}">\n`;
      tags.forEach(t => {
        html += `                        <option value="${t}">${t}</option>\n`;
      });
      html += `                      </optgroup>\n`;
    }
    return html;
  }

  const GENRE_OPTIONS_HTML  = _buildGenreOptionHTML();
  const container           = document.querySelector('.video-container');
  const containerHTML       = container ? container.innerHTML : '';
  const consoleLogId        = generateId();

  // Playlist base URL and index updated from skipad → videoPlayer path.
  const PLAYLIST_BASE_URL   = '/assets/data/apps/videoPlayer/playlists';
  const PLAYLIST_INDEX      = `${PLAYLIST_BASE_URL}/index.json`;

  // ---------------------------------------------------------------------------
  // Module variables
  // ---------------------------------------------------------------------------

  let isDev               = false;

  let player              = null;
  let lastState           = null;
  let playerMode          = null;
  let _startedFromPlaylist = false;                                          // claude - Modify J1 VideoPlayer #3
  let previousPlayerId    = null;
  let videoPlayerOptions  = null;
  let adapterOptions      = null;

  let pipWindow           = null;
  let pipEnabled          = false;
  let pipVisibilityBound  = false;

  let loopConfigEnabled   = false;
  let pipConfigEnabled    = false;

  var logger              = log4javascript.getLogger(MODULE_NAME);

  // ---------------------------------------------------------------------------
  // Helper Functions
  // ---------------------------------------------------------------------------

  /**
   * consoleLog - formatted console output with timestamp and unique ID
   */
  function consoleLog(level, module, message) {
    const timestamp = new Date().toISOString().slice(11, 23);

    switch (level) {
      case 'INFO':
        isDev ? console.log(`[${timestamp}] [${consoleLogId}] [${level}] [${module}] \n${message}`) : null;
        break;
      case 'WARN':
        isDev ? console.warn(`[${timestamp}] [${consoleLogId}] [${level}] [${module}] \n${message}`) : null;
        break;
      case 'ERROR':
        console.error(`[${timestamp}] [${consoleLogId}] [${level}] [${module}] \n${message}`);
        break;
      default:
        isDev ? console.log(`[${timestamp}] [${consoleLogId}] [${level}] [${module}] \n${message}`) : null;
        break;
    }
  }

  // ---------------------------------------------------------------------------
  // PlaylistManager
  // Central component for all video playlist operations on localStorage
  //
  // Extended to store native video metadata (src, poster) in playlist entries
  // instead of YouTube-specific fields.
  // ---------------------------------------------------------------------------
  class PlaylistManager {

    constructor() {
      this.STORAGE_KEY                    = 'playlist';
      this.INDEX_KEY                      = 'index';
      this._escapeHtmlEl                  = document.createElement('div');
      this._rateHandlerInitialized        = false;
      this._editHandlerInitialized        = false;
      this._infoLinkHandlerInitialized    = false;
      this._videoLinkHandlerInitialized   = false;
      // Fix J1 VideoPlayer #5
      // Added missing guard flags for play and delete handlers.
      // Without these, calling init twice would register duplicate listeners.
      this._playHandlerInitialized        = false;
      this._deleteHandlerInitialized      = false;
      this._searchResults                 = null;
      this._searchIndex                   = null;
      this._currentSort                   = 'watchDate';
      this._displayMode                   = localStorage.getItem('playlistMode') || 'cards';
      this._mergeMode                     = localStorage.getItem('mergeMode') === 'true';
      this._loopEnabled                   = localStorage.getItem('playlistLoop') === 'true';
      this._loopSwitchInitialized         = false;
    }

    setAdapterOptions(options) {
      adapterOptions = options;
      isDev         = (adapterOptions.env === 'development' || adapterOptions.env === 'dev')
        ? true
        : false;
    }

    _manageHiddenMode(visible) {
      const ids = ['playlistSearch', 'playlistBlock'];
      ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
          el.style.display = visible ? 'block' : 'none';
        }
      });
    }

    // Internal Helper Functions
    // -------------------------------------------------------------------------

    _formatDuration(seconds) {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = Math.floor(seconds % 60);
      if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
      return `${m}:${String(s).padStart(2, '0')}`;
    }

    _getTimeAgo(date) {
      const diff    = Date.now() - date.getTime();
      const mins    = Math.floor(diff / 60000);
      const hours   = Math.floor(diff / 3600000);
      const days    = Math.floor(diff / 86400000);
      const weeks   = Math.floor(days / 7);
      const months  = Math.floor(days / 30);

      if (mins < 1) return 'Just now';
      if (mins < 60) return `${mins} minute${mins > 1 ? 's' : ''} ago`;
      if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
      if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
      if (weeks < 5) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
      return `${months} month${months > 1 ? 's' : ''} ago`;
    }

    _escapeHtml(str) {
      this._escapeHtmlEl.textContent = str;
      return this._escapeHtmlEl.innerHTML;
    }

    _formatTimestamp() {
      const now  = new Date();
      const yyyy = now.getFullYear();
      const mo   = String(now.getMonth() + 1).padStart(2, '0');
      const dd   = String(now.getDate()).padStart(2, '0');
      const hh   = String(now.getHours()).padStart(2, '0');
      const mm   = String(now.getMinutes()).padStart(2, '0');
      const ss   = String(now.getSeconds()).padStart(2, '0');
      return `${yyyy}-${mo}-${dd}__${hh}-${mm}-${ss}`;
    }

    _parseDuration(text) {
      if (!text) return 0;
      const cleaned = text.replace(/[^0-9:]/g, '').trim();
      if (!cleaned) return 0;
      const parts = cleaned.split(':').map(Number);
      if (parts.some(isNaN)) return 0;
      if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
      if (parts.length === 2) return parts[0] * 60 + parts[1];
      return parts[0] || 0;
    }

    _isValidUrl(str) {
      if (!str || typeof str !== 'string') return false;
      try {
        const url = new URL(str);
        return url.protocol === 'http:' || url.protocol === 'https:';
      } catch (_) {
        return false;
      }
    }

    _updateInfoLinkButton() {
      const input = document.getElementById('editFieldInfoLink');
      const btn   = document.getElementById('editInfoLinkOpenBtn');
      if (!input || !btn) return;
      const valid = this._isValidUrl(input.value.trim());
      btn.style.display = valid ? 'inline-flex' : 'none';
    }

    _updateVideoLinkButton() {
      const input = document.getElementById('editFieldVideoLink');
      const btn   = document.getElementById('editVideoLinkOpenBtn');
      if (!input || !btn) return;
      const valid = this._isValidUrl(input.value.trim());
      btn.style.display = valid ? 'inline-flex' : 'none';
    }

    _normalizeIssueDate(str) {
      if (!str || typeof str !== 'string') return str;
      const trimmed = str.trim();
      if (!trimmed) return '';

      if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;

      const tzMap = {
        'ET': '-0500', 'EST': '-0500', 'EDT': '-0400',
        'CT': '-0600', 'CST': '-0600', 'CDT': '-0500',
        'MT': '-0700', 'MST': '-0700', 'MDT': '-0600',
        'PT': '-0800', 'PST': '-0800', 'PDT': '-0700',
        'UTC': '+0000', 'GMT': '+0000',
        'BST': '+0100', 'CET': '+0100', 'CEST': '+0200',
        'IST': '+0530', 'JST': '+0900', 'AEST': '+1000'
      };

      let dateTxt = trimmed.replace(
        /\b([A-Z]{2,4})\s*$/,
        (_, tz) => tzMap[tz] || tz
      );

      const parsed = new Date(dateTxt);
      if (isNaN(parsed.getTime())) return str;

      const yyyy = parsed.getUTCFullYear();
      const mo   = String(parsed.getUTCMonth() + 1).padStart(2, '0');
      const dd   = String(parsed.getUTCDate()).padStart(2, '0');

      return `${yyyy}-${mo}-${dd}`;
    }

    // _normalizeEntry: added 'src' and 'poster' fields for native video entries.
    // Legacy entries (imported from skipad playlists) that lack these fields
    // are backfilled with empty strings so the rest of the code can always
    // access entry.src and entry.poster without null-checks.
    _normalizeEntry(entry) {
      if (entry && typeof entry === 'object' && !('author' in entry)) {
        entry.author = '';
      }

      if (entry && typeof entry === 'object' && !('infoLink' in entry)) {
        entry.infoLink = '';
      }

      if (entry && typeof entry === 'object' && !('videoLink' in entry)) {
        entry.videoLink = '';
      }

      // Ensure native-video fields exist on every entry.
      if (entry && typeof entry === 'object') {
        if (!('src' in entry))     entry.src = '';
        if (!('poster' in entry))  entry.poster = '';
        // set poster image for youtube items
        //         
        if (('poster' in entry)) {
          const ytID = entry.videoLink.match(YOUTUBE_ID_RE);
          const isYt = (ytID) ? true : false;          
          if (isYt) {
            entry.poster = `https://img.youtube.com/vi/${ytID[1]}/${YOUTUBE_POSTER_QUALITY}.jpg`;
          } else {
            entry.poster  = DEFAULT_POSTER;        
          }
        }
      }

      if (entry && typeof entry === 'object') {
        if (!('lastPosition' in entry)) {
          entry.lastPosition = 0;
        }

        if (!('rating' in entry)) {
          entry.rating = 0;
        }

        if (!('issueDate' in entry)) {
          entry.issueDate = '';
        }

        if (entry.issueDate) {
          entry.issueDate = this._normalizeIssueDate(entry.issueDate);
        }
      }

      return entry;
    }

    // Core localStorage accessors
    // -------------------------------------------------------------------------

    load() {
      try {
        const data = localStorage.getItem(this.STORAGE_KEY);
        if (!data) return null;
        const parsed = JSON.parse(data);

        if (Array.isArray(parsed)) {
          parsed.forEach(entry => this._normalizeEntry(entry));
        }
        return parsed;
      } catch (e) {
        consoleLog('ERROR', MODULE_NAME, `error parsing localStorage data: ${e}`);
        return null;
      }
    }

    save(playlistArray) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(playlistArray));
      this._invalidateSearchIndex();
    }

    // CRUD operations
    // -------------------------------------------------------------------------

    /**
     * playlistManager
     * addEntry - add a new video to the playlist in localStorage.
     *
     * change skipAd API to local files #2
     * @param {Object} entry
     * @param {string}  [entry.src]          - full local or remote video URL/path
     * @param {string}  [entry.poster]       - poster image URL for the video
     * @param {string}  [entry.videoId]      - derived filename-without-extension key
     * @param {string}  [entry.videoLink]    - full video URL (identical to src for native)
     * (all other fields unchanged from skipad)
     */
    addEntry(entry) {
      const playlist = this.load() || [];

      const found = (playlist.find(item => item.videoId === entry.videoId)) ? true : false;
      if (found) {
        consoleLog('INFO', MODULE_NAME, `playlistmanager: skip adding entry with title: ${entry.title}`);
        return;
      }

      // Added 'src' and 'poster' fields.
      // 'videoLink' now defaults to entry.src (the local/remote video path)
      // instead of a YouTube watch URL.
      const record = {
        author:       entry.author        || '',
        category:     entry.category      || '',
        description:  entry.description   || '',
        duration:     entry.duration      || 0,
        infoLink:     entry.infoLink      || '',
        issueDate:    this._normalizeIssueDate(entry.issueDate || ''),
        episode:      entry.episode       || 0,
        lastPosition: entry.lastPosition  || 0,
        poster:       entry.poster        || '',
        rating:       entry.rating        || 0,
        series:       entry.series        || 0,
        src:          entry.src           || '',
        tags:         entry.tags          || [],
        title:        entry.title         || '',
        type:         entry.type          || 'video',
        videoLink:    entry.videoLink     || entry.src || '',
        videoId:      entry.videoId,
        watchDate:    new Date().toISOString()
      };

      const filtered = playlist.filter(item => item.videoId !== entry.videoId);
      filtered.unshift(record);
      this.save(filtered);

      consoleLog('INFO', MODULE_NAME, `playlistmanager: entry added for videoId: ${entry.videoId}`);

      this.renderCurrent();
    }

    updateEntryDuration(videoId, durationSeconds) {
      if (!videoId || !durationSeconds || durationSeconds <= 0) return;

      const playlist = this.load() || [];
      const entry   = playlist.find(item => item.videoId === videoId);
      if (!entry) return;

      entry.duration = durationSeconds;
      this.save(playlist);

      consoleLog('INFO', MODULE_NAME, `playlistmanager: duration updated for video with id: ${videoId} - ${this._formatDuration(durationSeconds)}`);

      this.renderCurrent();
    }

    // updateEntryAuthor retained for compatibility; for native videos the
    // author field is set from the title/metadata stored in the entry itself
    // or left blank when the source does not provide one.
    updateEntryAuthor(videoId, author) {
      if (!videoId || !author) return;

      const playlist = this.load() || [];
      const entry   = playlist.find(item => item.videoId === videoId);
      if (!entry) return;

      if (entry.author === author) return;

      entry.author = author;
      this.save(playlist);

      consoleLog('INFO', MODULE_NAME, `playlist entry author updated for videoId: ${videoId} - ${author}`);

      this.renderCurrent();
    }

    updateEntryPosition(videoId, positionSeconds) {
      if (!videoId || positionSeconds == null || positionSeconds < 0) return;

      const playlist = this.load() || [];
      const entry   = playlist.find(item => item.videoId === videoId);
      if (!entry) return;

      entry.lastPosition = positionSeconds;
      this.save(playlist);

      consoleLog('INFO', MODULE_NAME, `playlistmanager: position updated for video with id: ${videoId} - ${positionSeconds}s`);
    }

    updateWatchDate(videoId) {
      if (!videoId) return;

      const playlist = this.load() || [];
      const entry    = playlist.find(item => item.videoId === videoId);
      if (!entry) return;

      entry.watchDate = new Date().toISOString();
      this.save(playlist);

      consoleLog('INFO', MODULE_NAME, `playlistmanager: watchDate updated for video with id: ${videoId}`);

      this.renderCurrent();
    }

    updateEntryRating(videoId, rating) {
      if (!videoId || rating == null) return;

      const playlist = this.load() || [];
      const entry   = playlist.find(item => item.videoId === videoId);
      if (!entry) return;

      entry.rating = rating;
      this.save(playlist);

      consoleLog('INFO', MODULE_NAME, `playlistmanager: rating updated for videoId: ${videoId} - ${rating}`);

      this.renderCurrent();
    }

    updateEntryFields(videoId, fields) {
      if (!videoId || !fields) return;

      const playlist = this.load() || [];
      const entry   = playlist.find(item => item.videoId === videoId);
      if (!entry) return;

      if ('category'    in fields) entry.category     = fields.category;
      if ('description' in fields) entry.description  = fields.description;
      if ('episode'     in fields) entry.episode      = fields.episode;
      if ('infoLink'    in fields) entry.infoLink     = fields.infoLink;
      if ('videoLink'   in fields) entry.videoLink    = fields.videoLink;
      if ('issueDate'   in fields) entry.issueDate    = this._normalizeIssueDate(fields.issueDate);
      if ('series'      in fields) entry.series       = fields.series;
      if ('tags'        in fields) entry.tags         = fields.tags;
      if ('type'        in fields) entry.type         = fields.type;

      this.save(playlist);

      consoleLog('INFO', MODULE_NAME, `playlistmanager: fields updated for videoId: ${videoId}`);

      this.renderCurrent();
    }

    getEntryPosition(videoId) {
      if (!videoId) return 0;

      const playlist = this.load() || [];
      const entry   = playlist.find(item => item.videoId === videoId);
      return (entry && entry.lastPosition > 0) ? entry.lastPosition : 0;
    }

    getNextVideoId(currentVideoId) {
      if (!currentVideoId) return null;

      const playlist = this.load() || [];
      if (playlist.length < 2) return null;

      this._applySortOrder(playlist);

      const currentIndex = playlist.findIndex(item => item.videoId === currentVideoId);
      if (currentIndex < 0) return null;

      if (currentIndex >= playlist.length - 1) return null;

      return playlist[currentIndex + 1].videoId;
    }

    deleteEntry(videoId) {
      const playlist = this.load() || [];
      const updated = playlist.filter(item => item.videoId !== videoId);

      if (updated.length === playlist.length) {
        consoleLog('WARN', MODULE_NAME, `playlist entry not found for videoId: ${videoId}`);
        return;
      }

      this.save(updated);
      consoleLog('INFO', MODULE_NAME, `playlist entry deleted for videoId: ${videoId}`);

      this.renderCurrent();
    }

    clearPlaylist() {
      const playlist = this.load() || [];
      if (playlist.length === 0) {
        return false;
      }

      localStorage.removeItem(this.STORAGE_KEY);
      this._invalidateSearchIndex();

      consoleLog('INFO', MODULE_NAME, `cleared ${playlist.length} items from localStorage key: ${this.STORAGE_KEY}`);

      this._manageHiddenMode(false);
      this.renderCurrent();

      return true;
    }

    // Import / Export
    // -------------------------------------------------------------------------

    importFromUrl(url) {
      fetch(url)
        .then(res => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then(data => {
          if (!Array.isArray(data)) {
            consoleLog('ERROR', MODULE_NAME, 'imported URL does not contain a JSON array');
            return;
          }
          const hasMetaData = data.some(entry => entry.type === 'metaData');
          const videos      = hasMetaData ? data.filter(entry => entry.type === 'video') : data;

          videos.forEach(entry => this._normalizeEntry(entry));

          if (this._mergeMode) {
            const existing    = this.load() || [];
            const existingIds = new Set(existing.map(e => e.videoId));
            const newEntries  = videos.filter(e => !existingIds.has(e.videoId));
            const merged      = existing.concat(newEntries);
            this.save(merged);
            consoleLog('INFO', MODULE_NAME, `merged ${newEntries.length} new items (${videos.length - newEntries.length} duplicates skipped) into localStorage on key: ${this.STORAGE_KEY}`);
          } else {
            this.save(videos);
            consoleLog('INFO', MODULE_NAME, `imported ${videos.length} of ${data.length} items into localStorage on key: ${this.STORAGE_KEY}`);
          }
          this.renderCurrent();
        })
        .catch(err => consoleLog('ERROR', MODULE_NAME, `import from URL failed: ${err}`));
    }

    async importFromUrlAsync(url) {
      try {
        const res  = await fetch(url);
        if (!res.ok) {
          consoleLog('ERROR', MODULE_NAME, `import from URL failed: HTTP ${res.status}`);
          return;
        }
        const data = await res.json();
        if (data && typeof data === 'object' && !data.playlist) {
          consoleLog('ERROR', MODULE_NAME, 'imported URL does not contain a playlist');
          return;
        }

        const hasMetaData = (data && typeof data === 'object' && data.meta_data) ? true : false;
        const playlist    = hasMetaData ? data.playlist : data;

        playlist.forEach(entry => this._normalizeEntry(entry));

        if (this._mergeMode) {
          const existing    = this.load() || [];
          const existingIds = new Set(existing.map(e => e.videoId));
          const newEntries  = playlist.filter(e => !existingIds.has(e.videoId));
          const merged      = existing.concat(newEntries);
          this.save(merged);
          consoleLog('INFO', MODULE_NAME, `merged ${newEntries.length} new items (${playlist.length - newEntries.length} duplicates skipped) into localStorage on key: ${this.STORAGE_KEY}`);
        } else {
          this.save(playlist);
          consoleLog('INFO', MODULE_NAME, `imported ${playlist.length} items into localStorage on key: ${this.STORAGE_KEY}`);
        }
        this.renderCurrent();
      } catch (err) {
        consoleLog('ERROR', MODULE_NAME, `import from URL failed: ${err}`);
      }
    }

    importFromFile() {
      const fileInput = document.createElement('input');
      fileInput.type  = 'file';
      fileInput.accept = '.json,application/json';

      fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target.result);

            let videos;
            let totalCount;

            if (data && typeof data === 'object' && data.playlist) {
              videos     = data.playlist;
              totalCount = videos.length + (data.meta_data ? 1 : 0);
              consoleLog('INFO', MODULE_NAME, 'imported file uses new format (meta_data + playlist)');
            } else {
              consoleLog('ERROR', MODULE_NAME, 'imported file does not contain a valid playlist format');
              return;
            }

            videos.forEach(entry => this._normalizeEntry(entry));
            this.save(videos);
            consoleLog('INFO', MODULE_NAME, `imported ${videos.length} of ${totalCount} items from file: ${file.name}`);
            this.renderCurrent();
          } catch (err) {
            consoleLog('ERROR', MODULE_NAME, `import from file failed: ${err}`);
          }
        };
        reader.readAsText(file);
      });

      fileInput.click();
    }

    // Export filename changed from 'skipAd-playlist_...' to 'videoPlayer-playlist_...'.
    exportToFile(filename) {
      if (!filename) {
        filename = `videoPlayer-playlist_${this._formatTimestamp()}.json`;
      }
      const playlist = this.load();
      if (!playlist || playlist.length === 0) {
        consoleLog('WARN', MODULE_NAME, 'no playlist data to export');
        return;
      }

      const blob = new Blob(
        [JSON.stringify(playlist, null, 2)],
        { type: 'application/json' }
      );
      const url = URL.createObjectURL(blob);
      const a   = document.createElement('a');

      a.href     = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();

      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      consoleLog('INFO', MODULE_NAME, `exported ${playlist.length} items to file: ${filename}`);
    }

    // Rendering
    // -------------------------------------------------------------------------

    renderCurrent() {
      const currentData = this.load() || [];
      if (currentData.length === 0) {
        this._manageHiddenMode(false);
      } else {
        this._manageHiddenMode(true);
      }

      // Fix J1 VideoPlayer #2
      // ID corrected from 'playlistHistory' (non-existent) to
      // 'videoplayer_playlist_parent' to match the actual page element.
      const historyEl = document.getElementById('videoplayer_playlist_parent');
      if (historyEl) {
        if (this._displayMode === 'list') {
          historyEl.className = 'playlist list-mode';
        } else {
          historyEl.className = 'playlist card-mode';
        }
      }

      if (this._displayMode === 'list') {
        this.renderPlaylist();
      } else {
        this.renderCards();
      }

      if (!this._rateHandlerInitialized) {
        this.initRateHandler();
      }

      if (!this._editHandlerInitialized) {
        this.initEditHandler();
      }

      if (!this._infoLinkHandlerInitialized) {
        this.initInfoLinkHandler();
      }

      // Fix J1 VideoPlayer #2
      // Typo fixed: '_vidoLinkHandlerInitialized' → '_videoLinkHandlerInitialized'
      // (missing 'e'). The constructor declares '_videoLinkHandlerInitialized', so
      // the old misspelled name was always undefined, causing duplicate handler
      // registration on every renderCurrent() call.
      if (!this._videoLinkHandlerInitialized) {
        this.initVideoLinkHandler();
      }

      // Fix J1 VideoPlayer #5
      // initPlayHandler and initDeleteHandler were never called from
      // renderCurrent(), so clicking the play overlay or the delete button had
      // no effect.  Both handlers already existed; they just needed to be wired
      // in here, guarded by the new flags added to the constructor.
      if (!this._playHandlerInitialized) {
        this.initPlayHandler();
      }

      if (!this._deleteHandlerInitialized) {
        this.initDeleteHandler();
      }

      this._updateSortSelectVisibility();
      this._updateModeSwitchVisibility();
      this._updateMergeSwitchVisibility();

      if (loopConfigEnabled && !this._loopSwitchInitialized) {
        const titleBar = document.querySelector('.playlist-block-title');
        if (titleBar) {
          this._loopSwitchInitialized = true;
          new playlistLoopSwitchHandler();
          consoleLog('INFO', MODULE_NAME, 'playlistManager: loop switch initialized (lazy)');
        }
      }

      this._updateLoopSwitchVisibility();
    }

    // Fix J1 VideoPlayer #2
    // ID corrected from 'playlistHistory' (non-existent) to
    // 'videoplayer_playlist_parent' which is the actual element in the page.
    _getPlaylistContainer() {
      const el = document.getElementById('videoplayer_playlist_parent');
      if (!el) {
        consoleLog('ERROR', MODULE_NAME, 'playlist container element not found');
        consoleLog('WARN',  MODULE_NAME, 'processing playlist skipped');
      }
      return el;
    }

    // renderPlaylist: thumbnail src replaced with entry.poster or DEFAULT_POSTER.
    // YouTube CDN image URLs (img.youtube.com) have been removed.
    renderPlaylist() {
      const preCheckData = this.load() || [];
      if (preCheckData.length === 0) {
        this._manageHiddenMode(false);
        return;
      }
      this._manageHiddenMode(true);

      const playlistContainer = this._getPlaylistContainer();
      if (!playlistContainer) return;

      playlistContainer.className = 'playlist list-mode';

      isDev && logger.info('\n'+ `render playlist`);

      const data = this._searchResults || this.load() || [];
      this._applySortOrder(data);

      playlistContainer.innerHTML = data.map((item, index) => {
        const hasDuration   = (item.duration && item.duration > 0) ? true : false;
        const duration      = hasDuration ? this._formatDuration(item.duration) : '';
        const hasAuthor     = (item.author && item.author.trim().length > 0) ? true : false;
        const author        = hasAuthor ? item.author.trim() : '';
        const timeAgo       = this._getTimeAgo(new Date(item.watchDate));
        const hasRating     = (item.rating && item.rating > 0) ? true : false;
        const ratingStars   = hasRating ? '<i class="fas fa-star"></i>'.repeat(item.rating) : '';
        const hasInfoLink   = this._isValidUrl(item.infoLink);
        const hasVideoLink  = this._isValidUrl(item.videoLink);
        const thumbSrc      = item.poster || DEFAULT_POSTER; // fallback DEFAULT_POSTER

        return `
          <div class="playlist-row card-base" data-index="${index}" data-video-id="${item.videoId}">
            <div class="playlist-row-content">
              <div class="playlist-thumb-wrapper">
                <img class="playlist-thumb" src="${thumbSrc}" alt="playlist-thumb">
                <div class="playlist-play-overlay"><i class="fas fa-play"></i></div>
                <div class="playlist-duration">${duration}</div>
                ${hasRating ? `<div class="playlist-rating">${ratingStars}</div>` : ''}
              </div>
              <div class="playlist playlist-info-row">
                <div class="playlist-title">${this._escapeHtml(item.title)}${hasInfoLink ? ` <a class="playlist-info-link" href="${this._escapeHtml(item.infoLink)}" target="_blank" rel="noopener noreferrer" title="More info"><i class="fas fa-info-circle"></i></a>` : ''}</div>
                <div class="playlist-author">${this._escapeHtml(author)}</div>
                <div class="playlist-time-info">${timeAgo}</div>
              </div>
              <div class="playlist-playlist-actions">
                <button class="playlist-btn rate ${item.rating ? ' rated' : ''}" title="Set rating${item.rating ? ' (' + item.rating + '/5)' : ''}" aria-label="Set rating">
                  <i class="fas ${item.rating ? 'fa-star' : 'fa-star'}"></i>
                </button>
                <button class="playlist-btn edit" title="Edit item" aria-label="Edit item">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="playlist-btn delete" title="Delete from playlist" aria-label="Delete from playlist">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        `;

      }).join('');

      if (!this._rateHandlerInitialized) {
        this.initRateHandler();
      }

      if (!this._editHandlerInitialized) {
        this.initEditHandler();
      }
    }

    // renderCards: thumbnail src replaced with entry.poster or DEFAULT_POSTER.
    // YouTube CDN image URLs (img.youtube.com) have been removed.
    renderCards() {
      const preCheckData = this.load() || [];
      if (preCheckData.length === 0) {
        this._manageHiddenMode(false);
        return;
      }
      this._manageHiddenMode(true);

      const playlistContainer = this._getPlaylistContainer();
      if (!playlistContainer) return;

      playlistContainer.className = 'playlist card-mode';

      const data = this._searchResults || this.load() || [];
      this._applySortOrder(data);

      playlistContainer.innerHTML = data.map(v => {
        const hasDuration  = v.duration && v.duration > 0;
        const duration     = hasDuration ? this._formatDuration(v.duration) : '';
        const hasAuthor    = v.author && v.author.trim().length > 0;
        const timeAgo      = this._getTimeAgo(new Date(v.watchDate));
        const hasRating    = v.rating && v.rating > 0;
        const ratingStars  = hasRating ? '<i class="fas fa-star"></i>'.repeat(v.rating) : '';
        const hasInfoLink  = this._isValidUrl(v.infoLink);
        const hasVideoLink = this._isValidUrl(v.videoLink);
        const thumbSrc     = v.poster || DEFAULT_POSTER; // fallback to DEFAULT_POSTER

        return `
          <div class="playlist-card card-base" data-video-id="${v.videoId}">
            <div class="playlist-thumb-wrapper">
              <img class="playlist-thumb" src="${thumbSrc}" alt="playlist-thumb">
              <div class="playlist-play-overlay"><i class="fas fa-play"></i></div>
              ${hasDuration ? `<div class="playlist-duration">${duration}</div>` : ''}
              ${hasRating ? `<div class="playlist-rating">${ratingStars}</div>` : ''}
            </div>
            <div class="playlist-info">
              <div class="playlist-title">${this._escapeHtml(v.title)}${hasInfoLink ? ` <a class="playlist-info-link" href="${this._escapeHtml(v.infoLink)}" target="_blank" rel="noopener noreferrer" title="More info"><i class="fas fa-info-circle"></i></a>` : ''}</div>
              ${hasAuthor ? `<div class="playlist-author">${this._escapeHtml(v.author)}</div>` : ''}
              <div class="playlist-time-info">${timeAgo}</div>
              <div class="playlist-card-actions">
                <button class="playlist-btn rate ${v.rating ? ' rated' : ''}" title="Set rating ${v.rating ? ' (' + v.rating + '/5)' : ''}" aria-label="Set rating">
                  <i class="fas ${v.rating ? 'fa-star' : 'fa-star'}"></i>
                </button>
                <button class="playlist-btn edit" title="Edit item" aria-label="Edit item">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="playlist-btn delete" title="Delete from playlist" aria-label="Delete from playlist">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('');

      if (!this._rateHandlerInitialized) {
        this.initRateHandler();
      }

      if (!this._editHandlerInitialized) {
        this.initEditHandler();
      }
    }

    // Event delegation
    // -------------------------------------------------------------------------

    initDeleteHandler() {
      const playlistContainer = document.getElementById('videoplayer_playlist_parent') // Fix J1 VideoPlayer #2: corrected ID;
      if (!playlistContainer) return;

      // Fix J1 VideoPlayer #5
      // Guard flag set here to prevent duplicate listener registration.
      this._deleteHandlerInitialized = true;

      playlistContainer.addEventListener('click', (event) => {
        const deleteBtn = event.target.closest('.playlist-btn.delete');
        if (!deleteBtn) return;

        const row     = deleteBtn.closest('[data-video-id]');
        const videoId = row ? row.dataset.videoId : null;

        if (videoId) {
          this.deleteEntry(videoId);
        }
      });

      isDev && logger.info('\n'+ 'playlistManager: delete handler initialized');
    }

    // playEntry now resolves the video src from the playlist entry and passes
    // it to embedRunVideo so the native player receives a proper file URL.
    playEntry(videoId) {
      if (!videoId) {
        isDev && logger.warn('\n' + 'playlistManager: playEntry called without a videoId');
        return;
      }

      isDev && logger.info('\n'+ `playlistmanager: playing entry for videoId: ${videoId}`);
      _startedFromPlaylist = true;                                           // claude - Modify J1 VideoPlayer #3
      this.embedRunVideo(videoId);
    }

    // embedRunVideo looks up the 'src' field from the playlist entry
    // so that the native player receives the correct local/remote file URL.
    embedRunVideo(videoId, mode) {
      if (!videoId) {
        isDev && logger.warn('\n' + 'playlistManager: embedRunVideo called without a videoId');
        return;
      }

      isDev && logger.info('\n'+ `playlistManager: embedding video for videoId: ${videoId}`);

      // Resolve the src from the playlist entry; fall back to videoId as-is
      const playlist = this.load() || [];
      const entry    = playlist.find(item => item.videoId === videoId);
      const videoSrc = (entry && entry.src) ? entry.src : videoId;

      embedRunVideo(videoSrc, mode);
    }

    initPlayHandler() {
      const playlistContainer = document.getElementById('videoplayer_playlist_parent') // Fix J1 VideoPlayer #2: corrected ID;
      if (!playlistContainer) return;

      // Fix J1 VideoPlayer #5
      // Guard flag set here so renderCurrent() can protect against duplicate
      // listener registration (same pattern used by initRateHandler, etc.).
      this._playHandlerInitialized = true;

      playlistContainer.addEventListener('click', (event) => {
        const playOverlay = event.target.closest('.playlist-play-overlay');
        if (!playOverlay) return;

        const row     = playOverlay.closest('[data-video-id]');
        const videoId = row ? row.dataset.videoId : null;

        if (videoId) {
          this.playEntry(videoId);
        }
      });

      isDev && logger.info('\n'+ 'playlistManager: play handler initialized');
    }

    // _createRatingModal: thumbnail src now uses entry.poster or DEFAULT_POSTER
    // instead of the YouTube CDN (img.youtube.com).
    _createRatingModal(videoId) {
      if (document.getElementById('ratingModal')) return;

      // Resolve poster from playlist entry
      const playlist  = this.load() || [];
      const entry     = playlist.find(item => item.videoId === videoId);
      const thumbSrc  = (entry && entry.poster) ? entry.poster : DEFAULT_POSTER;

      const modalHTML = `
        <div id="ratingModal" class="modal fade" tabindex="-1"
          aria-labelledby="ratingModalLabel"
          data-bs-backdrop="static" data-bs-keyboard="false">
          <div class="modal-dialog modal-dialog-centered modal-notify modal-success">
            <div class="modal-content" style="max-width: 500px;">
              <div class="modal-header">
                <p id="ratingModalLabel" class="modal-title lead mb-3">Set Media Rating</p>
                <button id="closeRatingModal"
                  type="button" class="btn-close mb-3" data-bs-dismiss="modal" aria-label="Close">
                </button>
              </div>
              <div class="modal-body">
                <div class="playlist-thumb-wrapper mb-3">
                  <img id="ratingVideoThumb" class="playlist-thumb"
                       src="${thumbSrc}"
                       alt="playlist-thumb">
                </div>
                <div class="rating-dialog">
                  <div>
                    <p id="ratingVideoTitle" class="playlist-title"></p>
                    <p id="ratingVideoAuthor" class="playlist-author"></p>
                  </div>
                  <div style="text-align: center;">
                    <div id="ratingStars" class="rating-stars">
                      <span class="rating-star" data-value="1"><i class="fas fa-star"></i></span>
                      <span class="rating-star" data-value="2"><i class="fas fa-star"></i></span>
                      <span class="rating-star" data-value="3"><i class="fas fa-star"></i></span>
                      <span class="rating-star" data-value="4"><i class="fas fa-star"></i></span>
                      <span class="rating-star" data-value="5"><i class="fas fa-star"></i></span>
                    </div>
                    <p id="ratingLabel" class="rating-label"</p>
                  </div>
                  <div class="rating-modal-footer mb-2">
                    <button id="clearRatingBtn" class="rating-modal-btn rating-modal-btn-warning">Clear</button>
                    <button id="saveRatingBtn"  class="rating-modal-btn rating-modal-btn-primary" data-bs-dismiss="modal">Save Rating</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

      document.body.insertAdjacentHTML('beforeend', modalHTML);
      this._initRatingModalEvents();
    }

    _initRatingModalEvents() {
      const overlay   = document.getElementById('ratingModal');
      const saveBtn   = document.getElementById('saveRatingBtn');
      const clearBtn  = document.getElementById('clearRatingBtn');
      const starsWrap = document.getElementById('ratingStars');

      this._ratingModalVideoId = null;
      this._ratingModalValue   = 0;

      const ratingLabels = ['No rating', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

      const updateStarDisplay = (value) => {
        const stars = starsWrap.querySelectorAll('.rating-star');
        stars.forEach(star => {
          const v = parseInt(star.dataset.value, 10);
          star.classList.toggle('active', v <= value);
        });
        const label = document.getElementById('ratingLabel');
        if (label) label.textContent = ratingLabels[value] || 'No rating';
      };

      starsWrap.addEventListener('mouseover', (e) => {
        const star = e.target.closest('.rating-star');
        if (!star) return;
        const hoverVal = parseInt(star.dataset.value, 10);
        const stars = starsWrap.querySelectorAll('.rating-star');
        stars.forEach(s => {
          s.classList.toggle('hover', parseInt(s.dataset.value, 10) <= hoverVal);
        });
      });

      starsWrap.addEventListener('mouseout', () => {
        const stars = starsWrap.querySelectorAll('.rating-star');
        stars.forEach(s => s.classList.remove('hover'));
      });

      starsWrap.addEventListener('click', (e) => {
        const star = e.target.closest('.rating-star');
        if (!star) return;
        this._ratingModalValue = parseInt(star.dataset.value, 10);
        updateStarDisplay(this._ratingModalValue);
      });

      clearBtn.addEventListener('click', () => {
        this._ratingModalValue = 0;
        updateStarDisplay(0);
      });

      saveBtn.addEventListener('click', () => {
        if (this._ratingModalVideoId) {
          this.updateEntryRating(this._ratingModalVideoId, this._ratingModalValue);
          isDev && logger.debug('\n' + `playlistmanager: rating set to ${this._ratingModalValue} for videoId: ${this._ratingModalVideoId}`);
        }
      });

      this._updateRatingStarDisplay = updateStarDisplay;
    }

    // openRatingModal: thumbnail src resolves from playlist entry.poster
    // instead of constructing a YouTube CDN URL from the videoId.
    openRatingModal(videoId) {
      if (!videoId) return;

      if(!document.getElementById('ratingModal')) {
        this._createRatingModal(videoId);
      }

      const playlist = this.load() || [];
      const entry   = playlist.find(item => item.videoId === videoId);
      if (!entry) return;

      const titleEl  = document.getElementById('ratingVideoTitle');
      const authorEl = document.getElementById('ratingVideoAuthor');
      const thumbEl  = document.getElementById('ratingVideoThumb');

      if (titleEl)  titleEl.textContent  = entry.title  || videoId;
      if (authorEl) authorEl.textContent = entry.author || '';
      if (thumbEl)  thumbEl.src = entry.poster || DEFAULT_POSTER;

      this._ratingModalVideoId = videoId;
      this._ratingModalValue   = entry.rating || 0;
      if (this._updateRatingStarDisplay) {
        this._updateRatingStarDisplay(this._ratingModalValue);
      }

      const modalEl = document.getElementById('ratingModal');
      if (modalEl) {
        const bsModal = bootstrap.Modal.getOrCreateInstance(modalEl);
        bsModal.show();
      }
    }

    initRateHandler() {
      if (this._rateHandlerInitialized) return;

      const playlistContainer = document.getElementById('videoplayer_playlist_parent') // Fix J1 VideoPlayer #2: corrected ID;
      if (!playlistContainer) return;

      this._rateHandlerInitialized = true;

      playlistContainer.addEventListener('click', (event) => {
        const rateBtn = event.target.closest('.playlist-btn.rate');
        if (!rateBtn) return;

        const row     = rateBtn.closest('[data-video-id]');
        const videoId = row ? row.dataset.videoId : null;

        if (videoId) {
          this.openRatingModal(videoId);
        }
      });

      isDev && logger.debug('\n' + 'playlistManager: rate handler initialized');
    }

    // _createEditModal: thumbnail uses entry.poster; video link defaults to
    // entry.src (local/remote file path) instead of a YouTube watch URL.
    _createEditModal(videoId) {
      if (document.getElementById('editModal')) return;

      // Resolve poster from playlist entry
      const playlist  = this.load() || [];
      const entry     = playlist.find(item => item.videoId === videoId);
      const videoSrc  = (entry && entry.src)    ? entry.src    : '';
      const thumbSrc  = (entry && entry.poster) ? entry.poster : DEFAULT_POSTER;

      const modalHTML = `
        <div id="editModal" class="modal fade" tabindex="-1"
          aria-labelledby="editModalLabel"
          data-bs-backdrop="static" data-bs-keyboard="false">
          <div class="modal-dialog modal-dialog-scrollable modal-dialog-centered modal-notify modal-success">
            <div class="modal-content" style="max-width: 500px;">
              <div class="modal-header">
                <p id="editModalLabel" class="modal-title lead mb-3">Edit Media Settings</p>
                <button id="closeEditModal"
                  type="button" class="btn-close mb-3" data-bs-dismiss="modal" aria-label="Close">
                </button>
              </div>
              <div class="modal-body">
                <div class="playlist-thumb-wrapper mb-3">
                  <img id="editVideoThumb" class="playlist-thumb" src="${thumbSrc}" alt="playlist-thumb">
                </div>
                <div class="edit-dialog">

                  <div>
                    <p id="editVideoTitle" class="playlist-title"></p>
                    <p id="editVideoAuthor" class="playlist-author"></p>
                  </div>

                  <div class="edit-field-group">
                    <label class="edit-field-label" for="editFieldCategory">Category</label>
                    <select id="editFieldCategory" class="edit-field-input" form="playlist">
                      <option value="">Select a category</option>
                      <option value="Animals">Animals</option>
                      <option value="Beauty">Beauty</option>
                      <option value="Comedy">Comedy</option>
                      <option value="Education">Education</option>
                      <option value="Entertainment">Entertainment</option>
                      <option value="Events">Events</option>
                      <option value="Gaming">Gaming</option>
                      <option value="Howto">Howto</option>
                      <option value="Music">Music</option>
                      <option value="News">News</option>
                      <option value="People">People</option>
                      <option value="Sports">Sports</option>
                      <option value="Science">Science</option>
                      <option value="Technology">Technology</option>
                      <option value="Travel">Travel</option>
                      <option value="Vehicles">Vehicles</option>
                    </select>
                  </div>

                  <div class="edit-field-group">
                    <label class="edit-field-label" for="editFieldDescription">Description</label>
                    <textarea id="editFieldDescription" class="edit-field-input" placeholder="Description text ..." rows="3" style="overflow-y: auto; resize: vertical;"></textarea>
                  </div>

                  <div class="edit-field-group">
                    <label class="edit-field-label" for="editFieldSeries">Series</label>
                    <select id="editFieldSeries" class="edit-field-input" form="series">
                     <option value="">Enable|Disable Series</option>
                      <option value="0">No</option>
                      <option value="1">Yes</option>
                    </select>
                  </div>

                  <div class="edit-field-group">
                    <label class="edit-field-label" for="editFieldEpisode">Episode</label>
                    <input id="editFieldEpisode" type="number" class="edit-field-input" min="0" step="1" placeholder="0" />
                  </div>

                  <div class="edit-field-group">
                    <label class="edit-field-label" for="editFieldInfoLink">Info Link</label>
                    <div class="edit-field-info-link-wrapper" style="display:flex; align-items:center; gap:6px;">
                      <input id="editFieldInfoLink" type="url" class="edit-field-input" style="flex:1;" placeholder="e.g. https://en.wikipedia.org/wiki/..." />
                      <button id="editInfoLinkOpenBtn" type="button" title="Open link in new window"
                        style="display:none; border:none; background:transparent; cursor:pointer; padding:2px 4px; color:#0d6efd; font-size:1.1rem;"
                        aria-label="Open info link in new window">
                        <i class="fas fa-external-link-alt"></i>
                      </button>
                    </div>
                  </div>

                  <div class="edit-field-group videoplayer-videolink-group mt-2">
                    <label class="edit-field-label" for="entryVideoLink_${videoId}">Video Link</label>
                    <div class="edit-field-video-link-wrapper" style="display:flex; align-items:center; gap:6px;">
                      <input id="editFieldVideoLink" type="url" class="form-control" style="flex:1;"
                             placeholder="e.g. /assets/video/my-video.mp4 or https://example.com/v.mp4"
                             value="${videoSrc}" />
                      <button id="editVideoLinkOpenBtn" type="button" title="Open link in new window"
                        style="border:none; background:transparent; cursor:pointer; padding:2px 4px; color:#0d6efd; font-size:1.1rem;"
                        aria-label="Open video link in new window">
                        <i class="fas fa-external-link-alt"></i>
                      </button>
                    </div>
                  </div>

                  <div class="edit-field-group">
                    <label class="edit-field-label" for="editFieldIssueDate">Issue Date</label>
                    <input id="editFieldIssueDate" type="date" class="edit-field-input" placeholder="e.g. 2025-01-15" />
                  </div>

                  <div class="edit-field-group">
                    <label class="edit-field-label" for="editFieldTags">Tags</label>
                    <select id="editFieldTags" class="edit-field-input" form="playlist">
                      ${GENRE_OPTIONS_HTML}
                    </select>
                    <div style="display:flex; align-items:center; gap:6px; margin-top:4px;">
                      <input id="editFieldTagsCustom" type="text" class="edit-field-input" style="flex:1;"
                        placeholder="selected and custom tags (comma separated)" />
                    </div>
                  </div>

                  <div class="edit-field-group">
                    <label class="edit-field-label" for="editFieldType">Type</label>
                    <select id="editFieldType" class="edit-field-input" form="type">
                      <option value="">Select a content type</option>
                      <option value="video" selected>video</option>
                      <option value="audio">audio</option>
                    </select>
                  </div>

                  <div class="rating-modal-footer mb-2">
                    <button id="clearEditBtn" class="rating-modal-btn rating-modal-btn-warning">Clear</button>
                    <button id="saveEditBtn" class="rating-modal-btn rating-modal-btn-primary" data-bs-dismiss="modal">Save</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

      document.body.insertAdjacentHTML('beforeend', modalHTML);
      this._initEditModalEvents();
    }

    _initEditModalEvents() {
      const saveBtn  = document.getElementById('saveEditBtn');
      const clearBtn = document.getElementById('clearEditBtn');

      this._editModalVideoId = null;

      clearBtn.addEventListener('click', () => {
        document.getElementById('editFieldCategory').value      = '';
        document.getElementById('editFieldDescription').value   = '';
        document.getElementById('editFieldEpisode').value       = '';
        document.getElementById('editFieldInfoLink').value      = '';
        document.getElementById('editFieldVideoLink').value     = '';
        document.getElementById('editFieldIssueDate').value     = '';
        document.getElementById('editFieldSeries').value        = '';
        document.getElementById('editFieldTags').value          = '';
        document.getElementById('editFieldTagsCustom').value    = '';
        document.getElementById('editFieldType').value          = '';

        this._updateInfoLinkButton();
        this._updateVideoLinkButton();
      });

      const _appendTagToInput = (tag) => {
        const customInput = document.getElementById('editFieldTagsCustom');
        const current     = customInput.value
          .split(',').map(t => t.trim()).filter(Boolean);

        if (!current.includes(tag)) {
          current.push(tag);
          customInput.value = current.join(', ');
          customInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
      };

      const tagsSelect = document.getElementById('editFieldTags');
      tagsSelect.addEventListener('change', () => {
        const value = tagsSelect.value;
        if (value) {
          _appendTagToInput(value);
          tagsSelect.value = '';
          tagsSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });

      saveBtn.addEventListener('click', () => {
        if (this._editModalVideoId) {
          const tagsRaw = document.getElementById('editFieldTagsCustom').value;
          const tags    = tagsRaw
            ? [...new Set(tagsRaw.split(',').map(t => t.trim()).filter(Boolean))]
            : [];

          const fields = {
            category:     document.getElementById('editFieldCategory').value.trim(),
            description:  document.getElementById('editFieldDescription').value.trim(),
            episode:      parseInt(document.getElementById('editFieldEpisode').value, 10) || 0,
            infoLink:     document.getElementById('editFieldInfoLink').value.trim(),
            videoLink:    document.getElementById('editFieldVideoLink').value.trim(),
            issueDate:    document.getElementById('editFieldIssueDate').value.trim(),
            series:       parseInt(document.getElementById('editFieldSeries').value, 10) || 0,
            tags:         tags,
            type:         document.getElementById('editFieldType').value.trim() || 'video'
          };

          this.updateEntryFields(this._editModalVideoId, fields);
          isDev && logger.debug('\n' + `playlistmanager: fields saved for videoId: ${this._editModalVideoId}`);
        }
      });

      const infoLinkInput   = document.getElementById('editFieldInfoLink');
      const infoLinkOpenBtn = document.getElementById('editInfoLinkOpenBtn');

      if (infoLinkInput && infoLinkOpenBtn) {
        infoLinkInput.addEventListener('input', () => {
          this._updateInfoLinkButton();
        });

        infoLinkOpenBtn.addEventListener('click', () => {
          const url = infoLinkInput.value.trim();
          if (this._isValidUrl(url)) {
            window.open(url, '_blank', 'noopener,noreferrer');
          }
        });
      }

      const videoLinkInput   = document.getElementById('editFieldVideoLink');
      const videoLinkOpenBtn = document.getElementById('editVideoLinkOpenBtn');

      if (videoLinkInput && videoLinkOpenBtn) {
        videoLinkInput.addEventListener('input', () => {
          this._updateVideoLinkButton();
        });

        videoLinkOpenBtn.addEventListener('click', () => {
          const url = videoLinkInput.value.trim();
          if (this._isValidUrl(url)) {
            window.open(url, '_blank', 'noopener,noreferrer');
          }
        });
      }

      const episodeInput = document.getElementById('editFieldEpisode');
      const seriesSelect = document.getElementById('editFieldSeries');

      if (episodeInput && seriesSelect) {
        episodeInput.addEventListener('input', () => {
          const episodeValue = parseInt(episodeInput.value, 10) || 0;
          if (episodeValue > 0) {
            seriesSelect.value = '1';
            seriesSelect.dispatchEvent(new Event('change', { bubbles: true }));
          } else {
            seriesSelect.value = '0';
            seriesSelect.dispatchEvent(new Event('change', { bubbles: true }));
          }
        });
      }
    }

    // openEditModal: thumbnail and video link default to native video fields
    // (entry.poster, entry.src) instead of YouTube CDN / YouTube watch URL.
    openEditModal(videoId) {
      if (!videoId) return;

      if (!document.getElementById('editModal')) {
        this._createEditModal(videoId);
      }

      const playlist = this.load() || [];
      const entry    = playlist.find(item => item.videoId === videoId);
      if (!entry) return;

      const titleEl  = document.getElementById('editVideoTitle');
      const authorEl = document.getElementById('editVideoAuthor');
      const thumbEl  = document.getElementById('editVideoThumb');

      if (titleEl)  titleEl.textContent  = entry.title  || videoId;
      if (authorEl) authorEl.textContent = entry.author || '';
      if (thumbEl)  thumbEl.src = entry.poster || DEFAULT_POSTER;

      document.getElementById('editFieldCategory').value      = entry.category    || '';
      document.getElementById('editFieldDescription').value   = entry.description || '';
      document.getElementById('editFieldEpisode').value       = entry.episode     || '';
      document.getElementById('editFieldInfoLink').value      = entry.infoLink    || '';
      document.getElementById('editFieldVideoLink').value     = entry.videoLink   || entry.src || '';
      document.getElementById('editFieldIssueDate').value     = entry.issueDate   || '';
      document.getElementById('editFieldSeries').value        = entry.series      ? '1' : '';

      const entryTags = Array.isArray(entry.tags) ? entry.tags : [];
      document.getElementById('editFieldTagsCustom').value    = entryTags.join(', ');
      document.getElementById('editFieldTags').value          = '';
      document.getElementById('editFieldType').value          = entry.type        || 'video';

      this._updateInfoLinkButton();
      this._updateVideoLinkButton();

      this._editModalVideoId = videoId;

      const modalEl = document.getElementById('editModal');
      if (modalEl) {
        const bsModal = bootstrap.Modal.getOrCreateInstance(modalEl);
        bsModal.show();
      }
    }

    initEditHandler() {
      if (this._editHandlerInitialized) return;

      const playlistContainer = document.getElementById('videoplayer_playlist_parent') // Fix J1 VideoPlayer #2: corrected ID;
      if (!playlistContainer) return;

      this._editHandlerInitialized = true;

      playlistContainer.addEventListener('click', (event) => {
        const editBtn = event.target.closest('.playlist-btn.edit');
        if (!editBtn) return;

        const row     = editBtn.closest('[data-video-id]');
        const videoId = row ? row.dataset.videoId : null;

        if (videoId) {
          this.openEditModal(videoId);
        }
      });

      isDev && logger.info('\n'+ 'playlistManager: edit handler initialized');
    }

    initInfoLinkHandler() {
      if (this._infoLinkHandlerInitialized) return;

      const playlistContainer = document.getElementById('videoplayer_playlist_parent') // Fix J1 VideoPlayer #2: corrected ID;
      if (!playlistContainer) return;

      this._infoLinkHandlerInitialized = true;

      playlistContainer.addEventListener('click', (event) => {
        const infoLink = event.target.closest('.playlist-info-link');
        if (!infoLink) return;
        event.stopPropagation();
      });

      isDev && logger.info('\n'+ 'playlistManager: infoLink handler initialized');
    }

    initVideoLinkHandler() {
      if (this._videoLinkHandlerInitialized) return;

      const playlistContainer = document.getElementById('videoplayer_playlist_parent') // Fix J1 VideoPlayer #2: corrected ID;
      if (!playlistContainer) return;

      this._videoLinkHandlerInitialized = true;

      playlistContainer.addEventListener('click', (event) => {
        const videoLink = event.target.closest('.playlist-info-link');
        if (!videoLink) return;
        event.stopPropagation();
      });

      isDev && logger.info('\n'+ 'playlistManager: videoLink handler initialized');
    }

    // search engine
    // -------------------------------------------------------------------------

    _saveSearchIndex() {
      if (!this._searchIndex) return;
      try {
        localStorage.setItem(this.INDEX_KEY, JSON.stringify(this._searchIndex));
        isDev && logger.info('\n'+ 'playlistManager: search index saved to localStorage');
      } catch (e) {
        logger.error('\n' + `playlistManager: failed to save search index: ${e}`);
      }
    }

    _loadSearchIndex() {
      try {
        const stored = localStorage.getItem(this.INDEX_KEY);
        if (!stored) return false;
        this._searchIndex = lunr.Index.load(JSON.parse(stored));
        isDev && logger.info('\n' + 'playlistManager: search index loaded from localStorage');
        return true;
      } catch (e) {
        isDev && logger.debug('\n' + `playlistManager: failed to load search index from localStorage: ${e}`);
        this._searchIndex = null;
        return false;
      }
    }

    _invalidateSearchIndex() {
      this._searchIndex = null;
      localStorage.removeItem(this.INDEX_KEY);
    }

    buildSearchIndex() {
      const data = this.load() || [];
      const self = this;

      this._searchIndex = lunr(function () {
        this.ref('videoId');
        this.field('title',    { boost: 10 });
        this.field('author',   { boost: 5 });
        this.field('category', { boost: 3 });
        this.field('tags',     { boost: 3 });
        this.field('infoLink');
        this.field('videoLink');
        this.field('issueDate');
        this.field('type');

        data.forEach(function (entry) {
          self._normalizeEntry(entry);
          this.add({
            videoId:      entry.videoId     || '',
            title:        entry.title       || '',
            author:       entry.author      || '',
            category:     entry.category    || '',
            description:  entry.description || '',
            infoLink:     entry.infoLink    || '',
            videoLink:    entry.videoLink   || '',
            issueDate:    entry.issueDate   || '',
            type:         entry.type        || '',
            tags:         Array.isArray(entry.tags) ? entry.tags.join(' ') : '',
          });
        }, this);
      });

      isDev && logger.info('\n'+ `playlistManager: search index built with ${data.length} entries`);

      this._saveSearchIndex();
    }

    searchPlaylist(query) {
      if (!query || !query.trim()) {
        this.clearSearch();
        return [];
      }

      if (!this._searchIndex && !this._loadSearchIndex()) {
        this.buildSearchIndex();
      }

      if (!this._searchIndex) {
        isDev && logger.warn('\n' + 'playlistManager: search index not available');
        return [];
      }

      let lunrResults;
      try {
        lunrResults = this._searchIndex.search(query);
      } catch (e) {
        isDev && logger.warn('\n' + `playlistManager: lunr search error: ${e}`);
        lunrResults = [];
      }

      const data     = this.load() || [];
      const matchIds = new Set(lunrResults.map(r => r.ref));
      const results  = data.filter(item => matchIds.has(item.videoId));

      const orderMap = {};
      lunrResults.forEach((r, i) => { orderMap[r.ref] = i; });
      results.sort((a, b) => (orderMap[a.videoId] || 0) - (orderMap[b.videoId] || 0));

      this._searchResults = results;

      isDev && logger.debug('\n' + `playlistManager: search for "${query}" returned ${results.length} results`);

      this.renderCurrent();
      return results;
    }

    _applySortOrder(data) {
      if (!data || data.length === 0) return data;

      const criterion = this._currentSort || 'watchDate';

      switch (criterion) {
        case 'watchDate':
          data.sort((a, b) => new Date(b.watchDate) - new Date(a.watchDate));
          break;
        case 'watchDateAsc':
          data.sort((a, b) => new Date(a.watchDate) - new Date(b.watchDate));
          break;
        case 'title':
          data.sort((a, b) => (a.title || '').localeCompare(b.title || '', undefined, { sensitivity: 'base' }));
          break;
        case 'author':
          data.sort((a, b) => (a.author || '').localeCompare(b.author || '', undefined, { sensitivity: 'base' }));
          break;
        case 'duration':
          data.sort((a, b) => (b.duration || 0) - (a.duration || 0));
          break;
        case 'durationAsc':
          data.sort((a, b) => (a.duration || 0) - (b.duration || 0));
          break;
        case 'rating':
          data.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          break;
        case 'category':
          data.sort((a, b) => (a.category || '').localeCompare(b.category || '', undefined, { sensitivity: 'base' }));
          break;
        case 'type':
          data.sort((a, b) => (a.type || '').localeCompare(b.type || '', undefined, { sensitivity: 'base' }));
          break;
        case 'issueDate':
          data.sort((a, b) => {
            const da = a.issueDate ? new Date(a.issueDate) : new Date(0);
            const db = b.issueDate ? new Date(b.issueDate) : new Date(0);
            return db - da;
          });
          break;
        case 'issueDateAsc':
          data.sort((a, b) => {
            const da = a.issueDate ? new Date(a.issueDate) : new Date(0);
            const db = b.issueDate ? new Date(b.issueDate) : new Date(0);
            return da - db;
          });
          break;
        case 'episode':
          data.sort((a, b) => {
            const aSeries = a.series ? 1 : 0;
            const bSeries = b.series ? 1 : 0;
            if (aSeries !== bSeries) return bSeries - aSeries;
            return (a.episode || 0) - (b.episode || 0);
          });
          break;
        case 'series':
          data.sort((a, b) => {
            const aSeries = a.series ? 1 : 0;
            const bSeries = b.series ? 1 : 0;
            if (aSeries !== bSeries) return bSeries - aSeries;
            return (a.title || '').localeCompare(b.title || '', undefined, { sensitivity: 'base' });
          });
          break;
        default:
          break;
      }

      return data;
    }

    _updateSortSelectVisibility() {
      const sortSelect = document.getElementById('playlistSortSelect');
      if (!sortSelect) return;

      const data = this._searchResults || this.load() || [];
      sortSelect.style.display = data.length > 0 ? '' : 'none';

      this._updateSortOptionsVisibility(sortSelect, data);
    }

    _updateModeSwitchVisibility() {
      const listModeSwitch = document.getElementById('playlistModeSwitch');
      if (!listModeSwitch) return;

      const data = this._searchResults || this.load() || [];
      listModeSwitch.style.display = data.length > 0 ? '' : 'none';
    }

    _updateMergeSwitchVisibility() {
      const mergeModeSwitch = document.getElementById('playlistMergeSwitch');
      if (!mergeModeSwitch) return;

      const data = this._searchResults || this.load() || [];
      mergeModeSwitch.style.display = data.length > 0 ? '' : 'none';
    }

    _updateLoopSwitchVisibility() {
      const loopSwitch = document.getElementById('playlisLoopSwitch');
      if (!loopSwitch) return;

      if (!loopConfigEnabled) {
        loopSwitch.style.display = 'none';
        if (this._loopEnabled) {
          this._loopEnabled = false;
          localStorage.setItem('playlistLoop', 'false');
        }
        const checkbox = document.getElementById('loopMode');
        if (checkbox) checkbox.checked = false;
        return;
      }

      const data      = this._searchResults || this.load() || [];
      const allSeries = data.length > 0 && data.every(e => e.series && e.series >= 1);

      if (allSeries) {
        loopSwitch.style.display = '';
      } else {
        loopSwitch.style.display = 'none';

        if (this._loopEnabled) {
          this._loopEnabled = false;
          localStorage.setItem('playlistLoop', 'false');
          isDev && logger.debug('\n' + '_updateLoopSwitchVisibility: loop mode disabled (not all items are series)');
        }
        const checkbox = document.getElementById('loopMode');
        if (checkbox) {
          checkbox.checked = false;
        }
      }
    }

    _updateSortOptionsVisibility(selectEl, data) {
      const fieldTests = {
        title:       (d) => d.some(e => e.title       && e.title.trim()    !== ''),
        author:      (d) => d.some(e => e.author      && e.author.trim()   !== ''),
        duration:    (d) => d.some(e => e.duration    && e.duration > 0),
        durationAsc: (d) => d.some(e => e.duration    && e.duration > 0),
        rating:      (d) => d.some(e => e.rating      && e.rating > 0),
        category:    (d) => d.some(e => e.category    && e.category.trim() !== ''),
        description: (d) => d.some(e => e.description && e.description.trim() !== ''),
        type:        (d) => d.some(e => e.type        && e.type.trim()     !== ''),
        issueDate:   (d) => d.some(e => e.issueDate   && e.issueDate.trim() !== ''),
        issueDateAsc:(d) => d.some(e => e.issueDate   && e.issueDate.trim() !== ''),
        episode:     (d) => d.some(e => e.series),
      };

      const options = selectEl.options;
      for (let i = 0; i < options.length; i++) {
        const opt = options[i];

        if (!opt.value || opt.value.trim() === '') {
          opt.hidden   = true;
          opt.disabled = true;
          continue;
        }

        const test = fieldTests[opt.value];
        if (test) {
          const hasData = data.length > 0 && test(data);
          opt.hidden   = !hasData;
          opt.disabled = !hasData;
        } else {
          opt.hidden   = false;
          opt.disabled = false;
        }
      }

      const current    = selectEl.value;
      const currentOpt = selectEl.querySelector(`option[value="${current}"]`);
      if (currentOpt && currentOpt.hidden) {
        selectEl.value = 'watchDate';
        this.sortPlaylist('watchDate');
      }
    }

    sortPlaylist(criterion) {
      this._currentSort = criterion || 'watchDate';
      isDev && logger.debug('\n' + `playlistManager: sort criterion set to "${this._currentSort}"`);
      this.renderCurrent();
    }

    clearSearch() {
      this._searchResults = null;
      this.renderCurrent();
      isDev && logger.debug('\n' + 'playlistManager: search cleared');
    }

  } // END PlaylistManager

  const playlistManager = new PlaylistManager();

  {
    const data = playlistManager.load();
    if (!data || (Array.isArray(data) && data.length === 0)) {
      playlistManager._manageHiddenMode(false);
    }
  }

  // ---------------------------------------------------------------------------
  // Picture-in-Picture helpers (unchanged)
  // ---------------------------------------------------------------------------

  function _isPiPSupported() {
    if ('documentPictureInPicture' in window) return 'documentPiP';
    if (document.pictureInPictureEnabled) return 'videoPiP';
    return null;
  }

  async function _enterDocumentPiP(vjsPlayer) {
    if (!vjsPlayer) return false;
    if (pipWindow && !pipWindow.closed) {
      isDev && logger.info('\n'+ 'pip: Document PiP window already open');
      return true;
    }

    try {
      const playerEl = vjsPlayer.el();
      if (!playerEl) return false;

      const width  = Math.min(480, Math.round(window.innerWidth * 0.35));
      const height = Math.round(width * 9 / 16);

      pipWindow = await window.documentPictureInPicture.requestWindow({
        width:  width,
        height: height
      });

      [...document.styleSheets].forEach(sheet => {
        try {
          if (sheet.href) {
            const link  = pipWindow.document.createElement('link');
            link.rel    = 'stylesheet';
            link.href   = sheet.href;
            pipWindow.document.head.appendChild(link);
          } else if (sheet.cssRules) {
            const style = pipWindow.document.createElement('style');
            [...sheet.cssRules].forEach(rule => {
              style.appendChild(pipWindow.document.createTextNode(rule.cssText));
            });
            pipWindow.document.head.appendChild(style);
          }
        } catch (_) {}
      });

      const originalParent = playerEl.parentNode;
      const nextSibling    = playerEl.nextSibling;

      pipWindow.document.body.appendChild(playerEl);

      playerEl.style.width  = '100%';
      playerEl.style.height = '100%';

      pipWindow.addEventListener('pagehide', () => {
        if (originalParent) {
          if (nextSibling && nextSibling.parentNode === originalParent) {
            originalParent.insertBefore(playerEl, nextSibling);
          } else {
            originalParent.appendChild(playerEl);
          }
        }
        playerEl.style.width  = '';
        playerEl.style.height = '';

        pipWindow = null;
        isDev && logger.info('\n'+ 'pip: Document PiP window closed, player restored');
      });

      isDev && logger.info('\n'+ `pip: entered Document PiP (${width}x${height})`);
      pipEnabled = true;
      return true;

    } catch (err) {
      isDev && logger.warn('\n' + `pip: Document PiP request failed: ${err}`);
      pipWindow = null;
      return false;
    }
  }

  async function _enterVideoPiP(vjsPlayer) {
    if (!vjsPlayer) return false;

    try {
      const tech = vjsPlayer.tech({ IWillNotUseThisInPlugins: true });
      const videoEl = tech && tech.el();

      if (videoEl && typeof videoEl.requestPictureInPicture === 'function') {
        await videoEl.requestPictureInPicture();
        isDev && logger.info('\n'+ 'pip: entered standard video PiP');
        pipEnabled = true;
        return true;
      }
    } catch (err) {
      isDev && logger.warn('\n' + `pip: standard video PiP failed: ${err}`);
    }

    return false;
  }

  async function _exitPictureInPicture(vjsPlayer) {
    if (pipWindow && !pipWindow.closed) {
      pipWindow.close();
      pipWindow = null;
      isDev && logger.info('\n'+ 'pip: closed Document PiP window');
      return;
    }

    if (document.pictureInPictureElement) {
      try {
        await document.exitPictureInPicture();
        isDev && logger.debug('\n' + 'pip: exited standard video PiP');
      } catch (err) {
        isDev && logger.warn('\n' + `pip: exitPictureInPicture failed: ${err}`);
      }
    }
  }

  async function _requestPictureInPicture(vjsPlayer) {
    const mode = _isPiPSupported();

    if (mode === 'documentPiP') {
      return _enterDocumentPiP(vjsPlayer);
    }

    if (mode === 'videoPiP') {
      return _enterVideoPiP(vjsPlayer);
    }

    isDev && logger.warn('\n' + 'pip: no PiP API supported by this browser');
    return false;
  }

  function _initPiPVisibilityHandler(vjsPlayer) {
    if (pipVisibilityBound) return;
    pipVisibilityBound = true;

    document.addEventListener('visibilitychange', async () => {
      if (!vjsPlayer || vjsPlayer.isDisposed()) return;

      if (document.visibilityState === 'hidden') {
        const paused = vjsPlayer.paused();
        if (!paused) {
          isDev && logger.info('\n'+ 'pip: tab hidden while playing, requesting PiP');
          const ok = await _requestPictureInPicture(vjsPlayer);
          if (!ok) {
            isDev && logger.info('\n'+ 'pip: PiP unavailable, playback may pause in background');
          }
        }
      } else if (document.visibilityState === 'visible') {
        if (pipWindow && !pipWindow.closed) {
          isDev && logger.info('\n'+ 'pip: tab visible again, closing PiP window');
          await _exitPictureInPicture(vjsPlayer);
        }
      }
    });

    isDev && logger.info('\n'+ 'pip: auto-PiP visibility handler installed');
  }

  function _playWhenVisible(vjsPlayer) {
    if (!vjsPlayer) return;

    if (document.visibilityState === 'visible') {
      const p = vjsPlayer.play();
      if (p && typeof p.catch === 'function') {
        p.catch(err => {
          isDev && logger.warn('\n' + `play() rejected: ${err}`);
        });
      }
    } else {
      isDev && logger.info('\n'+ 'play deferred: page is hidden, attempting PiP before fallback');

      (async () => {
        const pipOk = pipConfigEnabled ? await _requestPictureInPicture(vjsPlayer) : false;
        if (pipOk) {
          const p = vjsPlayer.play();
          if (p && typeof p.catch === 'function') {
            p.catch(err => {
              isDev && logger.warn('\n' + `play() inside PiP rejected: ${err}`);
            });
          }
        } else {
          isDev && logger.debug('\n' + 'pip: falling back to visibility-deferred play()');
          const onVisible = () => {
            if (document.visibilityState === 'visible') {
              document.removeEventListener('visibilitychange', onVisible);
              isDev && logger.debug('\n' + 'page became visible, starting deferred play()');
              const p = vjsPlayer.play();
              if (p && typeof p.catch === 'function') {
                p.catch(err => {
                  consoleLog('WARN', MODULE_NAME, `deferred play() rejected: ${err}`);
                });
              }
            }
          };
          document.addEventListener('visibilitychange', onVisible);
        }
      })();
    }
  }

  // ---------------------------------------------------------------------------
  // embedRunVideo
  // Extend J1 VideoPlayer #1
  // Extended to support both YouTube video IDs and native file URLs.
  // When the input matches YOUTUBE_PATTERNS the player is created with
  // YouTube tech (techOrder: ['youtube', 'html5'], type: 'video/youtube').
  // For native video files the original HTML5 tech path is unchanged.
  //
  // Renamed parameter: videoId → videoSrc.  The function now accepts a full
  // local or remote video file URL (e.g. /assets/video/my.mp4 or
  // https://cdn.example.com/video.mp4) instead of a YouTube video ID.
  // The videoId for playlist keying is derived from the filename without
  // its extension so existing playlist-management logic is unaffected.
  // ---------------------------------------------------------------------------

  /**
   * embedRunVideo - embed and play a video via videoJS.
   * Accepts either a YouTube video ID / URL or a native file URL/path.
   * @param {string} videoSrc  - YouTube video ID or local/remote video URL
   * @param {string} [mode]    - optional player mode ('pause' to start paused)
   */
  const embedRunVideo = (videoSrc, mode) => {
    logger = log4javascript.getLogger(MODULE_NAME);

    isDev && logger.debug('\n'+ `embedding video from src: ${videoSrc}`);

    // reset lastState so state change events fire correctly for the new player
    lastState = null;

    // target mode for the vjs player
    playerMode = (mode === undefined) ? null : mode;

    // Extend J1 VideoPlayer #1
    // Detect whether the input is a YouTube video ID / URL so the right
    // tech and playlist-key derivation are used below.
    const youtubeMatch = (() => {
      for (const pattern of YOUTUBE_PATTERNS) {
        const m = (videoSrc || '').match(pattern);
        if (m) return m[1];
      }
      return null;
    })();

    const isYouTube = !!youtubeMatch;

    // Derive a stable videoId for playlist keying:
    //   - YouTube:  the 11-char video ID extracted from the URL
    //   - Native:   filename without extension (unchanged from #2)
    const videoId = isYouTube
      ? youtubeMatch
      : (videoSrc
          ? videoSrc.split('?')[0].split('/').pop().replace(/\.[^.]+$/, '') || videoSrc
          : '');

    const vjsPlayer = createVideoJsPlayer(videoId, videoSrc, isYouTube, {
      title: '',

      onStateChange: (() => {
        let errorNumber = null;
        return (event) => {
          const state = event.data;

          if (state === lastState || errorNumber) {
            return;
          }

          const stateName = vjsStateEventNameMap[state] || (state < 0 ? 'loadstart' : String(state));
          isDev && logger.debug('\n'+ `changed player to state: ${stateName}`);

          if (vjsStateEventNameMap[state] === 'playing') {
            doPostOnPlaying(state);
          }

          // persist the current playback position when the video is
          // paused or has ended so the user can resume later.
          if (vjsStateEventNameMap[state] === 'paused' || vjsStateEventNameMap[state] === 'ended') {
            try {
              const currentPos    = player.currentTime();
              const totalDuration = player.duration();

              // Extend J1 VideoPlayer #1
              // For YouTube videos use player.ytVideoData.video_id;
              // for native videos use player.videoData.videoId (unchanged from #2).
              const currentVideoId = isYouTube
                ? ((player.ytVideoData && player.ytVideoData.video_id) ? player.ytVideoData.video_id : videoId)
                : ((player.videoData   && player.videoData.videoId)    ? player.videoData.videoId    : videoId);

              if (currentVideoId && currentPos > 0) {
                const positionToSave = (vjsStateEventNameMap[state] === 'ended') ? 0 : currentPos;
                playlistManager.updateEntryPosition(currentVideoId, positionToSave);
              }

              // loop mode
              if (vjsStateEventNameMap[state] === 'ended' && loopConfigEnabled && playlistManager._loopEnabled) {
                const nextId = playlistManager.getNextVideoId(currentVideoId);
                if (nextId) {
                  isDev && logger.debug('\n' + `loop mode: advancing from videoId ${currentVideoId} to next videoId ${nextId}`);
                  // Extend J1 VideoPlayer #1
                  // For native entries, resolve src from the playlist entry;
                  // for YouTube entries, the nextId itself is the video ID.
                  const playlist  = playlistManager.load() || [];
                  const nextEntry = playlist.find(item => item.videoId === nextId);
                  const nextSrc   = (nextEntry && nextEntry.src) ? nextEntry.src : nextId;
                  setTimeout(() => {
                    embedRunVideo(nextSrc);
                  }, VIDEO_START_DELAY);
                } else {
                  isDev && logger.debug('\n' + `loop mode: reached last playlist item, stopping loop`);
                }
              }

            } catch (e) {
              isDev && logger.warn('\n' + `failed to save playback position: ${e}`);
            }
          }

          lastState = state;
        };
      })(),

      // videoJS event: onReady
      onReady: (player) => {
        isDev && logger.info('\n'+ 'vjs player initialized and ready');

        if (isYouTube) {
          // ---------------------------------------------------------------
          // Extend J1 VideoPlayer #1
          // YouTube tech path: mirror the onReady logic from skipad.js.
          // Metadata is read from the YouTube tech's videoData() / ytPlayer.
          // ---------------------------------------------------------------
          const applyVideoData = (videoData) => {
            if (!videoData) return;
            const title  = videoData.title  || '';
            const author = videoData.author || '';

            isDev && logger.debug('\n'+ `YT video data resolved - title: ${title}`);

            player.ytVideoData  = videoData;
            player.ytVideoTitle = title;

            const playerEl = player.el();
            if (playerEl) {
              playerEl.setAttribute('aria-label', title);
            }

            document.dispatchEvent(new CustomEvent('ytVideoTitleResolved', {
              detail: { title: title, playerId: player.id_ },
              bubbles: true
            }));
          };

          // immediate read: the tech may already have the data cached
          try {
            const tech = player.tech({ IWillNotUseThisInPlugins: true });
            if (tech && typeof tech.videoData === 'function') {
              const cachedData = tech.videoData();
              if (cachedData && Object.keys(cachedData).length) {
                applyVideoData(cachedData);
              }
            }
          } catch (e) {
            isDev && logger.debug('\n'+ `immediate YT video data read skipped: ${e}`);
          }

          // playlistManager, fixed video duration (YouTube)
          player.on('durationchange', () => {
            const durationDisplay = player.controlBar && player.controlBar.durationDisplay;
            if (!durationDisplay) return;

            const durationEl   = durationDisplay.contentEl();
            const durationText = durationEl ? durationEl.textContent : '';
            const seconds      = videoPlayer.playlistManager._parseDuration(durationText);

            if (seconds > 0) {
              const currentVideoId = player.ytVideoData && player.ytVideoData.video_id
                ? player.ytVideoData.video_id
                : videoId;
              videoPlayer.playlistManager.updateEntryDuration(currentVideoId, seconds);

              player.off('durationchange');
            }
          });

          // resume from saved position if available (YouTube)
          const savedPositionYT = videoPlayer.playlistManager.getEntryPosition(videoId);
          if (savedPositionYT > 0) {
            const onFirstPlayingYT = () => {
              player.off('playing', onFirstPlayingYT);
              setTimeout(() => {
                player.currentTime(savedPositionYT);
                consoleLog('INFO', MODULE_NAME, `resumed YouTube video id: ${videoId} at last position ${savedPositionYT}s`);
              }, 250);
            };
            player.on('playing', onFirstPlayingYT);
          }

        } else {
          // ---------------------------------------------------------------
          // Native video path (unchanged from #2).
          // ---------------------------------------------------------------
          const applyVideoData = (videoData) => {
            if (!videoData) return;
            const title  = videoData.title  || '';
            const author = videoData.author || '';

            isDev && logger.debug('\n'+ `video data resolved - title: ${title}`);

            player.videoData  = videoData;
            player.videoTitle = title;

            const playerEl = player.el();
            if (playerEl) {
              playerEl.setAttribute('aria-label', title);
            }

            document.dispatchEvent(new CustomEvent('videoTitleResolved', {
              detail: { title: title, playerId: player.id_ },
              bubbles: true
            }));
          };

          const onVideoDataResolved = (e) => {
            document.removeEventListener('videoDataResolved', onVideoDataResolved);
            if (e && e.detail && e.detail.videoData) {
              applyVideoData(e.detail.videoData);
            }
          };
          document.addEventListener('videoDataResolved', onVideoDataResolved);

          // playlistManager, fixed video duration (native)
          player.on('durationchange', () => {
            const durationDisplay = player.controlBar && player.controlBar.durationDisplay;
            if (!durationDisplay) return;

            const durationEl   = durationDisplay.contentEl();
            const durationText = durationEl ? durationEl.textContent : '';
            const seconds      = videoPlayer.playlistManager._parseDuration(durationText);

            if (seconds > 0) {
              const currentVideoId = player.videoData && player.videoData.videoId
                ? player.videoData.videoId
                : videoId;
              videoPlayer.playlistManager.updateEntryDuration(currentVideoId, seconds);

              player.off('durationchange');
            }
          });

          // resume from saved position if available (native)
          const savedPosition = videoPlayer.playlistManager.getEntryPosition(videoId);
          if (savedPosition > 0) {
            const onFirstPlaying = () => {
              player.off('playing', onFirstPlaying);
              setTimeout(() => {
                player.currentTime(savedPosition);
                consoleLog('INFO', MODULE_NAME, `resumed video with id: ${videoId} at last position ${savedPosition}s`);
              }, 250);
            };
            player.on('playing', onFirstPlaying);
          }
        } // END if isYouTube / else

        // Options reference changed from j1.adapter.skipad.skipAdOptions
        // to j1.adapter.videoPlayer.videoPlayerOptions.
        videoPlayerOptions = j1.adapter.videoPlayer.videoPlayerOptions;

        loopConfigEnabled = !!(videoPlayerOptions.playlist && videoPlayerOptions.playlist.loop && videoPlayerOptions.playlist.loop.enabled);
        pipConfigEnabled  = !!(videoPlayerOptions.playlist && videoPlayerOptions.playlist.loop && videoPlayerOptions.playlist.loop.pip);

        if (videoPlayerOptions.videoJS.autoStart) {

          isDev && logger.info('\n'+ 'vjs player started');

          const vjsPlaybackRates  = videoPlayerOptions.videoJS.playbackRates.values;

          const piAutoCaption     = videoPlayerOptions.videoJS.plugins.autoCaption;
          const piHotKeys         = videoPlayerOptions.videoJS.plugins.hotKeys;
          const piSkipButtons     = videoPlayerOptions.videoJS.plugins.skipButtons;
          const piZoomButtons     = videoPlayerOptions.videoJS.plugins.zoomButtons;

          isDev && logger.debug('\n'+ 'customize vjs player (controls)');

          const vjsPlayer = player;

          // add custom progressControlSlider
          const customProgressContainer = vjsPlayer.controlBar.addChild('Component', {
            el: videojs.dom.createEl('div', {
              className: 'vjs-theme-uno custom-progressbar-container'
            })
          });

          const progressControlSlider = vjsPlayer.controlBar.progressControl;
          if (progressControlSlider) {
            customProgressContainer.el().appendChild(progressControlSlider.el());
          }

          const currentTimeDisplay = vjsPlayer.controlBar.currentTimeDisplay;
          if (currentTimeDisplay) {
            customProgressContainer.el().insertBefore(currentTimeDisplay.el(), progressControlSlider.el());
          }

          const durationDisplay = vjsPlayer.controlBar.durationDisplay;
          if (durationDisplay) {
            customProgressContainer.el().appendChild(durationDisplay.el());
          }

          // add|skip playbackRates
          if (videoPlayerOptions.videoJS.playbackRates.enabled) {
            vjsPlayer.playbackRates(vjsPlaybackRates);
          }

          // add|skip skipButtons plugin
          if (piSkipButtons.enabled) {
            let backwardIndex = piSkipButtons.backward;
            let forwardIndex  = piSkipButtons.forwardIndex;

            if (piSkipButtons.surroundPlayButton) {
              backwardIndex = 0;
              forwardIndex  = 1;
            }

            vjsPlayer.skipButtons({
              backwardIndex:  backwardIndex,
              forwardIndex:   forwardIndex,
              backward:       piSkipButtons.backward,
              forward:        piSkipButtons.forward,
            });
          }

          // Extend J1 VideoPlayer #2
          // For YouTube, hide the VJS control bar when configured.
          // players.youtube.controls === 0 means the YouTube IFrame API hides
          // its own chrome; the VJS control bar is hidden separately here.
          // For native videos the control bar is always shown.
          const ytControls = videoPlayerOptions.videoJS.players.youtube
            ? videoPlayerOptions.videoJS.players.youtube.controls
            : undefined;
          if (isYouTube && (videoPlayerOptions.videoJS.hideControlBar || ytControls === 0)) {
            isDev && logger.debug('\n'+ 'hiding vjs controlbar for YT video');
            vjsPlayer.addClass('vjs-youtube-hide-controlbar');
          }

          // Extend J1 VideoPlayer #2
          // Autoplay: read from players.youtube for YouTube, players.native for
          // native video — both driven by the defaults in videoPlayer.yml.
          const autoplay = isYouTube
            ? (videoPlayerOptions.videoJS.players.youtube && videoPlayerOptions.videoJS.players.youtube.autoplay)
            : (videoPlayerOptions.videoJS.players.native  && videoPlayerOptions.videoJS.players.native.autoplay);

          if (autoplay) {
            if (playerMode === 'pause') {
              setTimeout(() => vjsPlayer.pause(), VIDEO_START_DELAY);
            } else {
              setTimeout(() => _playWhenVisible(vjsPlayer), VIDEO_START_DELAY);
            }
          }

          // PiP support (unchanged logic)
          if (pipConfigEnabled) {
            _initPiPVisibilityHandler(vjsPlayer);
          }

          if (pipConfigEnabled && _isPiPSupported() === 'documentPiP') {
            const PiPButton = videojs.getComponent('Button');

            class DocumentPiPButton extends PiPButton {
              constructor(player, options) {
                super(player, options);
                this.controlText('Picture-in-Picture');
                this.addClass('vjs-pip-button');
              }
              handleClick() {
                if (pipWindow && !pipWindow.closed) {
                  _exitPictureInPicture(player);
                } else {
                  _requestPictureInPicture(player);
                }
              }
            }

            videojs.registerComponent('DocumentPiPButton', DocumentPiPButton);
            vjsPlayer.controlBar.addChild('DocumentPiPButton', {});

            const nativePiP = vjsPlayer.controlBar.getChild('pictureInPictureToggle');
            if (nativePiP) {
              nativePiP.hide();
            }

            consoleLog('INFO', MODULE_NAME, 'pip: custom Document PiP button added to control bar');
          } else {
            const nativePiP = vjsPlayer.controlBar.getChild('pictureInPictureToggle');
            if (nativePiP) {
              nativePiP.hide();
            }
          }
        } // END if videoPlayerOptions.videoJS.autoStart
      } // END onReady
    }); // END vjsPlayer
  }; // END embedRunVideo

  /**
   * doPostOnPlaying - post-processing after state change to 'playing'
   * Extend J1 VideoPlayer #1
   * Extended to handle both YouTube (player.ytVideoData) and native
   * (player.videoData) metadata, mirroring skipad.js for the YouTube path.
   * @param {number} state - player state code
   */
  function doPostOnPlaying(state) {
    const titleElement = document.getElementById("video_title");
    const videoElement = document.getElementById("video_container");
    const textEl       = document.getElementById('video_title_text');

    isDev && logger.debug('\n'+ `do post processing on state: ${vjsStateEventNameMap[state]}`);

    // Extend J1 VideoPlayer #1
    // Choose the right video-data source depending on which tech is active.
    // YouTube: player.ytVideoData (set in onReady YouTube branch).
    // Native:  player.videoData  (set by nativePlayer plugin via 'videoDataResolved').
    const isYouTubePlayer = !!(player && player.ytVideoData);

    if (isYouTubePlayer) {
      // YouTube path - mirror skipad.js doPostOnPlaying()
      document.dispatchEvent(new CustomEvent('videoPlayingStarted', {
        detail: { videoId: player.ytVideoData?.video_id || '' },
        bubbles: true
      }));

      // refresh author from live YT player object
      try {
        const tech      = player.tech({ IWillNotUseThisInPlugins: true });
        const ytPlayer  = tech.ytPlayer;
        const freshData = ytPlayer.getVideoData();
        player.ytVideoData.author = freshData.author;
      } catch (_e) {
        // tech not yet fully ready; author stays as-is
      }

      const vd  = player.ytVideoData;
      const vid = vd.video_id || '';

      if (textEl && vd) {
        const title  = vd.title  || player.ytVideoTitle || '';
        const author = vd.author || '';
        textEl.textContent = author ? ` ${author} · ${title}` : title;
      } else if (textEl && player.ytVideoTitle) {
        textEl.textContent = player.ytVideoTitle;
      }

      // Extend J1 VideoPlayer #3
      // Added 'poster' field: resolves to the highest-quality YouTube thumbnail
      // (maxresdefault.jpg) so list and card items show the real poster image
      // instead of falling back to DEFAULT_POSTER.
      const media = {
        videoId:      vid,
        title:        vd.title  || player.ytVideoTitle || '',
        author:       vd.author || '',
        infoLink:     `https://youtu.be/watch?v=${vid}`,
        poster:       vid ? `//img.youtube.com/vi/${vid}/maxresdefault.jpg` : '',
        duration:     player.duration(),
        lastPosition: 0
      };
      const newItem = [ media ];

      newItem.forEach(entry => playlistManager.addEntry(entry));

      if (vid && vd.author) {
        playlistManager.updateEntryAuthor(vid, vd.author);
      }

      const durationYT = player.duration();
      if (vid && durationYT > 0) {
        playlistManager.updateEntryDuration(vid, Math.floor(durationYT));
      }

      if (vid) {
        playlistManager.updateWatchDate(vid);
      }

    } else {
      // Native video path (unchanged from #2)
      document.dispatchEvent(new CustomEvent('videoPlayingStarted', {
        detail: { videoId: player.videoData && player.videoData.videoId || '' },
        bubbles: true
      }));

      const vd  = player.videoData || {};
      const vid = vd.videoId || '';

      if (textEl) {
        const title  = vd.title  || player.videoTitle || '';
        const author = vd.author || '';
        textEl.textContent = author ? ` ${author} · ${title}` : title;
      }

      const media = {
        src:          vd.src      || '',
        poster:       vd.poster   || '',
        videoId:      vid,
        title:        vd.title    || player.videoTitle || '',
        author:       vd.author   || '',
        infoLink:     '',
        videoLink:    vd.src      || '',
        duration:     player.duration(),
        lastPosition: 0
      };
      const newItem = [ media ];

      newItem.forEach(entry => playlistManager.addEntry(entry));

      if (vid && vd.author) {
        playlistManager.updateEntryAuthor(vid, vd.author);
      }

      const duration = player.duration();
      if (vid && duration > 0) {
        playlistManager.updateEntryDuration(vid, Math.floor(duration));
      }

      if (vid) {
        playlistManager.updateWatchDate(vid);
      }
    }

    if (titleElement) {
      titleElement.style.display = "flex";
    }

    // claude - Modify J1 VideoPlayer #3
    // When the video was started by clicking a playlist card, collapse the
    // playlist panel so the video container has the full viewport while
    // playing.  The flag is reset immediately so subsequent non-playlist
    // plays (e.g. direct embed) are not affected.
    if (_startedFromPlaylist) {
      _startedFromPlaylist = false;

      if (typeof j1.adapter.videoPlayer.closePlaylist === 'function') {
        j1.adapter.videoPlayer.closePlaylist();
      }
    }

    if (videoElement) {
      scrollToElement(videoElement);
    }
  }

  /**
   * scrollToElement - scroll to element's (vertical) top position
   */
  function scrollToElement(elm) {
    if (!elm) return;

    const targetElmPosition = elm.offsetTop;
    const scrollOffset      = (window.innerWidth >= 720) ? -180 : -130;
    const position          = targetElmPosition + scrollOffset;

    isDev && logger.debug('\n'+ `scroll page to vertical position: ${position}`);
    window.scrollTo(0, position);
  }

  /**
   * generateId - generate a random alphanumeric ID string
   */
  function generateId(length = 11) {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let id = '';
    for (let i = 0; i < length; i++) {
      id += chars[Math.floor(Math.random() * chars.length)];
    }
    return id;
  }

  /**
   * createVideoJsPlayer
   * Extend J1 VideoPlayer #1
   * Extended to support YouTube tech when isYouTube is true.
   * When isYouTube is true the player is configured identically to
   * skipad.js (techOrder: ['youtube', 'html5'], type: 'video/youtube',
   * src: '//youtu.be/<videoId>').
   * When isYouTube is false the original HTML5-only path is used unchanged.
   *
   * change skipAd API to local files #2
   * Replaced YouTube-tech player creation with native HTML5 tech (native path).
   * - techOrder: ['html5']   (was ['youtube', 'html5'])
   * - source type: auto-detected from file extension (was 'video/youtube')
   * - source URL:  videoSrc parameter (was '//youtu.be/${videoId}')
   * - nativePlayer plugin registered so custom events are dispatched
   * - 'vjs-youtube' class replaced with 'vjs-native'
   *
   * @param {string}  videoId   - YouTube video ID or filename-without-extension key
   * @param {string}  videoSrc  - YouTube ID / URL or native file URL/path
   * @param {boolean} isYouTube - true → YouTube tech; false → HTML5 tech
   * @param {Object}  options   - player callbacks (onStateChange, onReady, title)
   * @returns {Object|null}     - VideoJS player instance or null on failure
   */
  function createVideoJsPlayer(videoId, videoSrc, isYouTube, options = {}) {

    if (!container) {
      consoleLog('ERROR', MODULE_NAME, `Container or overlay element not found`);
      return null;
    }

    if (player) {
      isDev && consoleLog('INFO', MODULE_NAME, `Disposing existing videoJS player: ${player.id_}`);

      if (pipWindow && !pipWindow.closed) {
        pipWindow.close();
        pipWindow = null;
      }
      pipVisibilityBound = false;
      pipEnabled         = false;

      player.dispose();
      player = null;
    }

    const overlayExists = document.getElementById('emptyPlayerOverlay');
    if (!overlayExists) {
      isDev && consoleLog('INFO', MODULE_NAME, `Restoring container and overlay for new video`);
      container.innerHTML = containerHTML;
    }

    const currentOverlay = document.getElementById('emptyPlayerOverlay');
    if (!currentOverlay) {
      isDev && consoleLog('ERROR', MODULE_NAME, `Overlay element could not be restored`);
      return null;
    }

    // Ensure the player element ID is always a valid CSS selector by
    // prepending 'vjs-' (unchanged from original pattern).
    const playerElementId = `vjs-${videoId}`;

    const video       = document.createElement('video');
    video.id          = playerElementId;
    video.className   = 'video-js vjs-theme-uno';
    video.controls    = true;
    video.width       = 640;
    video.height      = 360;

    video.setAttribute('aria-label', options.title || 'Video Player');

    currentOverlay.replaceWith(video);

    let videoConfig;

    if (isYouTube) {
      // Extend J1 VideoPlayer #2
      // YouTube tech configuration: all player parameters are now read from
      // videoPlayerOptions.videoJS.players.youtube (videoPlayer.yml) instead
      // of being hardcoded.  This replaces the static skipad.js equivalent.
      const vpo     = (typeof j1 !== 'undefined' && j1.adapter && j1.adapter.videoPlayer)
        ? j1.adapter.videoPlayer.videoPlayerOptions
        : null;
      const ytCfg   = (vpo && vpo.videoJS && vpo.videoJS.players && vpo.videoJS.players.youtube)
        ? vpo.videoJS.players.youtube
        : {};

      // Build the YouTube playerVars object from players.youtube defaults.
      // Only numeric / string params that the YouTube IFrame API accepts are
      // forwarded; boolean flags (end, start) are used elsewhere in the module
      // and are intentionally excluded from playerVars.
      const ytPlayerVars = {};
      const ytParamKeys = [
        'cc_load_policy', 'controls', 'disablekb', 'enablejsapi',
        'fs', 'iv_load_policy', 'loop', 'modestbranding', 'rel', 'showinfo'
      ];
      ytParamKeys.forEach(key => {
        if (key in ytCfg) ytPlayerVars[key] = ytCfg[key];
      });

      videoConfig = {
        fluid:     !!(ytCfg.fluid !== undefined ? ytCfg.fluid : true),
        techOrder: ['youtube', 'html5'],
        sources: [{
          type: 'video/youtube',
          src:  `//youtu.be/${videoId}`
        }],
        youtube: {
          playerVars: ytPlayerVars
        },
        controlBar: {
          pictureInPictureToggle: false,
          volumePanel: {
            inline: false
          }
        }
      };

      isDev && consoleLog('INFO', MODULE_NAME, `createVideoJsPlayer: YouTube playerVars from players.youtube: ${JSON.stringify(ytPlayerVars)}`);

    } else {
      // Extend J1 VideoPlayer #2
      // Native HTML5 tech configuration: all player parameters are now read
      // from videoPlayerOptions.videoJS.players.native (videoPlayer.yml)
      // instead of being hardcoded.  Static defaults are used as fallback
      // values when videoPlayerOptions is not yet available.
      const vpo      = (typeof j1 !== 'undefined' && j1.adapter && j1.adapter.videoPlayer)
        ? j1.adapter.videoPlayer.videoPlayerOptions
        : null;
      const ntvCfg   = (vpo && vpo.videoJS && vpo.videoJS.players && vpo.videoJS.players.native)
        ? vpo.videoJS.players.native
        : {};

      // Auto-detect MIME type from the file extension so that MP4, WebM
      // and OGV sources are all accepted without hardcoding.
      const extMap = {
        mp4:  'video/mp4',
        webm: 'video/webm',
        ogv:  'video/ogg',
        ogg:  'video/ogg',
        m4v:  'video/mp4',
        mov:  'video/mp4'
      };
      const srcExt  = (videoSrc || '').split('?')[0].split('.').pop().toLowerCase();
      const srcType = extMap[srcExt] || 'video/mp4';

      // videoJS configuration: HTML5 tech only.
      // Boolean/string player params are taken from players.native defaults;
      // static fallback values match the previous hardcoded behaviour.
      videoConfig = {
        fluid:       !!(ntvCfg.fluid       !== undefined ? ntvCfg.fluid       : true),
        fill:        !!(ntvCfg.fill        !== undefined ? ntvCfg.fill        : false),
        responsive:  !!(ntvCfg.responsive  !== undefined ? ntvCfg.responsive  : true),
        playsinline: !!(ntvCfg.playsinline !== undefined ? ntvCfg.playsinline : true),
        preload:     ntvCfg.preload || 'auto',
        sources: [{
          type: srcType,
          src:  videoSrc
        }],
        controlBar: {
          pictureInPictureToggle: false,
          volumePanel: {
            inline: false
          }
        }
      };

      // Apply poster from players.native if no dedicated poster is present
      // on the entry itself (poster resolution happens later in nativePlayer
      // plugin; this sets the initial VJS poster attribute).
      if (ntvCfg.default_poster) {
        videoConfig.poster = ntvCfg.default_poster;
      }

      isDev && consoleLog('INFO', MODULE_NAME, `createVideoJsPlayer: native config from players.native: fluid=${videoConfig.fluid}, responsive=${videoConfig.responsive}, preload=${videoConfig.preload}`);
    }

    if (typeof videojs !== 'undefined') {
      player = videojs(playerElementId, videoConfig, function onPlayerReady() {
        isDev && consoleLog('INFO', MODULE_NAME, `player ready on id: ${playerElementId}`);

        if (options.onStateChange) {
          const vjsPlayer = this;

          Object.keys(vjsStateEventMap).forEach(function(eventName) {
            vjsPlayer.on(eventName, function() {
              options.onStateChange({ data: vjsStateEventMap[eventName] });
            });
          });
        }

        if (!isYouTube) {
          // Register the nativePlayer plugin so it starts dispatching the
          // 'videoDataResolved', 'videoEnded' and 'videoManualPlay' custom
          // DOM events that the adapter (onReady) and loop mode rely on.
          if (typeof this.nativePlayer === 'function') {
            this.nativePlayer({ title: options.title || '' });
            isDev && consoleLog('INFO', MODULE_NAME, `nativePlayer plugin activated on: ${playerElementId}`);
          } else {
            isDev && consoleLog('WARN', MODULE_NAME, `nativePlayer plugin not available - custom events will not be dispatched`);
          }
        }

        if (options.onReady) {
          options.onReady(this);
        }
      });
    }

    previousPlayerId = videoId;

    return player;
  } // END createVideoJsPlayer()

  // ---------------------------------------------------------------------------
  // Helper Classes
  // ---------------------------------------------------------------------------

  /**
   * inputWrapperHandler
   * Extend J1 VideoPlayer #1
   * Supports both YouTube URLs/IDs (routed to YouTube tech) and native
   * local/remote video URLs (routed to HTML5 tech).  YouTube detection
   * uses YOUTUBE_PATTERNS (identical to skipad.js); native video detection
   * uses VIDEO_URL_PATTERNS.  The class keeps the same public interface.
   */
  class inputWrapperHandler {
    constructor() {
      this.elements = this.cacheElements();
      this.init();
    }

    cacheElements() {
      return {
        pasteButton:      document.getElementById('pasteButton'),
        videoUrlInput:    document.getElementById('videoUrlInput'),
        loadVideoButton:  document.getElementById('loadVideo'),
        clearInputButton: document.getElementById('playlistInputClear')
      };
    }

    init() {
      const { pasteButton, videoUrlInput, loadVideoButton, clearInputButton } = this.elements;

      if (pasteButton) {
        pasteButton.addEventListener('click', () => this.handlePasteClick());
      }

      if (loadVideoButton) {
        loadVideoButton.addEventListener('click', () => this.handleLoadVideo());
      }

      if (clearInputButton) {
        clearInputButton.addEventListener('click', () => this.handleClearInput());
      }

      if (videoUrlInput) {
        videoUrlInput.addEventListener('paste', (e) => this.handleDirectPaste(e));
        videoUrlInput.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            this.handleLoadVideo();
          }
        });

        videoUrlInput.addEventListener('input', (e) => {
          this._toggleClearButton(e.target.value);
        });

        videoUrlInput.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') {
            e.preventDefault();
            this.handleClearInput();
            videoUrlInput.blur();
          }
        });
      }
    }

    async handlePasteClick() {
      try {
        if (!navigator.clipboard || !navigator.clipboard.readText) {
          isDev && consoleLog('WARN', MODULE_NAME, MESSAGES.NO_CLIPBOARD_API);
          return;
        }

        window.focus();
        this.elements.videoUrlInput.focus();

        const text = await navigator.clipboard.readText();
        this.elements.videoUrlInput.value = text.trim();
        this._toggleClearButton(text.trim());
        this.processUrl();
      } catch (err) {
        isDev && consoleLog('ERROR', MODULE_NAME, `Clipboard read error: ${err}`);
      }
    }

    handleDirectPaste(_event) {
      setTimeout(() => {
        this._toggleClearButton(this.elements.videoUrlInput.value);
        this.processUrl();
      }, PASTE_DELAY);
    }

    handleLoadVideo() {
      this.processUrl();
    }

    handleClearInput() {
      this.elements.videoUrlInput.value = '';
      this._toggleClearButton('');
      this.elements.videoUrlInput.focus();
    }

    _toggleClearButton(value) {
      const { clearInputButton } = this.elements;
      if (clearInputButton) {
        clearInputButton.style.display = (value && value.trim()) ? 'inline-flex' : 'none';
      }
    }

    processUrl() {
      const url = this.elements.videoUrlInput.value.trim();
      if (url === "") {
        isDev && consoleLog('WARN', MODULE_NAME, MESSAGES.NO_URL);
        return;
      }

      // Extend J1 VideoPlayer #1
      // Try YouTube first; fall back to native video URL matching.
      const youtubeId = this.extractVideoId(url);
      if (youtubeId) {
        // duplicate check using the YouTube video ID
        if (previousPlayerId !== null && youtubeId === previousPlayerId) {
          isDev && consoleLog('WARN', MODULE_NAME, `player already exists with id: ${youtubeId}`);
          return;
        }
        isDev && consoleLog('INFO', MODULE_NAME, `Loading YouTube video with id: ${youtubeId}`);
        this.loadAdFreeVideo(youtubeId);
        return;
      }

      // extractVideoSrc returns the raw URL/path for native video files.
      const videoSrc = this.extractVideoSrc(url);

      // Duplicate check uses filename-without-extension as the id key.
      const videoId  = videoSrc
        ? videoSrc.split('?')[0].split('/').pop().replace(/\.[^.]+$/, '') || videoSrc
        : null;

      if (previousPlayerId !== null && videoId === previousPlayerId) {
        isDev && consoleLog('WARN', MODULE_NAME, `player already exists with id: ${videoId}`);
        return;
      }

      if (videoSrc) {
        isDev && consoleLog('INFO', MODULE_NAME, `Loading video from src: ${videoSrc}`);
        this.loadVideo(videoSrc);
      } else {
        isDev && consoleLog('ERROR', MODULE_NAME, MESSAGES.INVALID_URL);
      }
    }

    /**
     * extractVideoId
     * Extend J1 VideoPlayer #1
     * Detects YouTube URLs and bare video IDs using YOUTUBE_PATTERNS
     * (identical to skipad.js).  Returns the 11-character video ID on
     * a match, otherwise returns null.
     * @param {string} url - raw input from the URL field
     * @returns {string|null} - YouTube video ID or null
     */
    extractVideoId(url) {
      for (const pattern of YOUTUBE_PATTERNS) {
        const match = (url || '').match(pattern);
        if (match) {
          return match[1];
        }
      }
      return null;
    }

    /**
     * loadAdFreeVideo
     * Extend J1 VideoPlayer #1
     * Loads a YouTube video by ID through the YouTube tech path.
     * Mirrors the loadAdFreeVideo() method from skipad.js.
     * @param {string} videoId - YouTube video ID
     */
    loadAdFreeVideo(videoId) {
      isDev && logger.info('\n'+ `Loading YouTube video with id: ${videoId}`);

      const event = new CustomEvent('videoLoad', {
        detail: { videoId },
        bubbles: true
      });

      document.dispatchEvent(event);

      document.addEventListener('videoPlayingStarted', () => {
        this.elements.videoUrlInput.value = '';
        this._toggleClearButton('');
        isDev && logger.debug('\n' + 'inputWrapperHandler: input cleared after video started');
      }, { once: true });

      embedRunVideo(videoId);
    }

    /**
     * extractVideoSrc
     * change skipAd API to local files #2
     * Replaces extractVideoId (YouTube).  Returns the trimmed URL/path when
     * it matches VIDEO_URL_PATTERNS, otherwise returns null.
     * A bare value with no extension is also accepted as a fallback so that
     * relative filenames without dots still go through to the player.
     * @param {string} url - raw input from the URL field
     * @returns {string|null} - validated video src or null
     */
    extractVideoSrc(url) {
      const trimmed = (url || '').trim();
      if (!trimmed) return null;

      for (const pattern of VIDEO_URL_PATTERNS) {
        if (pattern.test(trimmed)) {
          return trimmed;
        }
      }

      // Accept any non-empty string as a last resort so that unusual but
      // valid server-relative URLs (e.g. /stream/live) still work.
      return trimmed || null;
    }

    /**
     * loadVideo
     * change skipAd API to local files #2
     * Renamed from loadAdFreeVideo (YouTube) to loadVideo (native).
     * Dispatches 'videoLoad' with the video src URL instead of a YouTube ID.
     * @param {string} videoSrc - validated video URL/path
     */
    loadVideo(videoSrc) {
      isDev && logger.info('\n'+ `Loading video from: ${videoSrc}`);

      const event = new CustomEvent('videoLoad', {
        detail: { videoSrc },
        bubbles: true
      });

      document.dispatchEvent(event);

      document.addEventListener('videoPlayingStarted', () => {
        this.elements.videoUrlInput.value = '';
        this._toggleClearButton('');
        isDev && logger.debug('\n' + 'inputWrapperHandler: input cleared after video started');
      }, { once: true });

      embedRunVideo(videoSrc);
    }
  }

  // ---------------------------------------------------------------------------
  // playlistIOHandler
  //
  // DOM ID 'skipad_playlist_parent' replaced with 'videoplayer_playlist_parent'
  // in all scroll-to-element calls.
  // ---------------------------------------------------------------------------
  class playlistIOHandler {
    constructor(options) {
      this._videoPlayerOptions = options || null;
      this.elements            = this.cacheElements();
      this.init();
    }

    cacheElements() {
      return {
        importButton:         document.getElementById('playlistImportButton'),
        exportButton:         document.getElementById('playlistExportButton'),
        importFile:           document.getElementById('playlistImportFile'),
        clearButton:          document.getElementById('playlistClearButton'),
        serverPlaylistSelect: document.getElementById('serverPlaylistSelect'),
        serverPlaylistLoad:   document.getElementById('serverPlaylistLoadButton'),
        serverSelectClear:    document.getElementById('playlistSelectClear')
      };
    }

    init() {
      const { importButton, exportButton, importFile, clearButton, serverPlaylistSelect, serverPlaylistLoad, serverSelectClear } = this.elements;

      if (importButton) {
        importButton.addEventListener('click', () => this.handleImport());
      }

      if (exportButton) {
        exportButton.addEventListener('click', () => this.handleExport());
      }

      if (importFile) {
        importFile.addEventListener('change', (e) => this.handleFileSelected(e));
      }

      if (clearButton) {
        clearButton.addEventListener('click', () => this.handleClear());
      }

      if (serverPlaylistLoad) {
        serverPlaylistLoad.addEventListener('click', () => this.handleLoadFromServer());
      }

      if (serverSelectClear) {
        serverSelectClear.addEventListener('click', () => this.handleClearServerSelect());
      }

      if (serverPlaylistSelect) {
        serverPlaylistSelect.addEventListener('change', () => {
          this._toggleServerSelectClear(serverPlaylistSelect.value);
        });
        this._serverSelectChangeBound = true;
      }

      this.loadPlaylistIndex();

      isDev && logger.info('\n'+ 'playlistManager: IOHandler initialized');
    }

    handleImport() {
      const { importFile } = this.elements;
      if (importFile) {
        importFile.value = '';
        importFile.click();
      }
    }

    handleFileSelected(event) {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);

          const hasMetaData = (data && typeof data === 'object' && data.backup_date) ? true : false;
          const playlist    = hasMetaData ? data.playlist : data;

          if (hasMetaData) {
            const bkupDate = data.backup_date.replace('T', ' ').substring(0, 16);
            isDev && logger.info('\n'+ `import playlist from backup file of date: ${bkupDate}`);
          }

          playlist.forEach(entry => playlistManager._normalizeEntry(entry));

          if (playlistManager._mergeMode) {
            const existing    = playlistManager.load() || [];
            const existingIds = new Set(existing.map(e => e.videoId));
            const newEntries  = playlist.filter(e => !existingIds.has(e.videoId));
            const merged      = existing.concat(newEntries);
            playlistManager.save(merged);
            isDev && logger.debug('\n' + `merged ${newEntries.length} new items (${playlist.length - newEntries.length} duplicates skipped) from file`);
          } else {
            playlistManager.save(playlist);
          }

          const loaded     = playlistManager.load() || [];
          const hasSeries  = loaded.some(entry => entry.series > 0);
          const hasEpisode = loaded.some(entry => entry.episode > 0);

          if (hasSeries || hasEpisode) {
            const sortSelect = document.getElementById('playlistSortSelect');
            if (sortSelect) {
              sortSelect.value = 'episode';
            }
            playlistManager.sortPlaylist('episode');
            isDev && logger.info('\n'+ 'playlistManager: series/episode entries detected - auto-sorted by episode');
          }

          if (!playlistManager._searchIndex && !playlistManager._loadSearchIndex()) {
            isDev && logger.info('\n'+ 'playlistManager: build search index from scratch');
            playlistManager.buildSearchIndex();
          }

          const overlayExists = document.getElementById('emptyPlayerOverlay');
          if (!overlayExists) {
            isDev && logger.debug('\n' + `Restoring container and overlay for new video`);
            container.innerHTML = containerHTML;
          }

          playlistManager.renderCurrent();

          // DOM id changed from 'skipad_playlist_parent' to 'videoplayer_playlist_parent'.
          const videoElement = document.getElementById('videoplayer_playlist_parent');
          if (videoElement) {
            scrollToElement(videoElement);
          }
        } catch (err) {
          logger.error('\n' + `import from file failed: ${err}`);
        }
      };

      reader.readAsText(file);
    }

    handleExport() {
      playlistManager.exportToFile();
    }

    handleClear() {
      // Reference changed from this._skipAdOptions to this._videoPlayerOptions.
      const opts = this._videoPlayerOptions;
      if (opts === null || !opts.enabled) {
        return;
      }

      const cleared = playlistManager.clearPlaylist();
      if (cleared) {
        location.reload();
      }
    }

    handleClearServerSelect() {
      const { serverPlaylistSelect } = this.elements;
      if (serverPlaylistSelect) {
        serverPlaylistSelect.selectedIndex = 0;
        this._toggleServerSelectClear('');
        isDev && logger.info('\n'+ 'playlistManager: server playlist selection cleared');
      }
    }

    _toggleServerSelectClear(value) {
      const { serverSelectClear } = this.elements;
      if (serverSelectClear) {
        serverSelectClear.style.display = (value && value.trim()) ? 'inline-flex' : 'none';
      }
    }

    loadPlaylistIndex(attempt = 1, maxAttempts = 5) {
      let selectEl = this.elements.serverPlaylistSelect;
      if (!selectEl) {
        selectEl = document.getElementById('serverPlaylistSelect');
        if (selectEl) {
          this.elements.serverPlaylistSelect = selectEl;

          if (!this._serverSelectChangeBound) {
            selectEl.addEventListener('change', () => {
              this._toggleServerSelectClear(selectEl.value);
            });
            this._serverSelectChangeBound = true;
          }
        }
      }

      if (!selectEl) {
        if (attempt <= maxAttempts) {
          const delay = 500 * attempt;
          isDev && logger.warn('\n' + `loadPlaylistIndex: serverPlaylistSelect not in DOM, retry ${attempt}/${maxAttempts} in ${delay}ms`);
          setTimeout(() => this.loadPlaylistIndex(attempt + 1, maxAttempts), delay);
        } else {
          logger.error('\n' + 'loadPlaylistIndex: serverPlaylistSelect element not found after ' + maxAttempts + ' attempts');
        }
        return;
      }

      fetch(PLAYLIST_INDEX)
        .then(res => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then(index => {
          if (!Array.isArray(index) || index.length === 0) {
            isDev && logger.warn('\n' + 'playlist index is empty or not an array');
            return;
          }

          selectEl.innerHTML = `
            <option value="" disabled selected>
              Select a playlist for import ...
            </option>
          `;

          index.forEach(entry => {
            const option       = document.createElement('option');
            option.value       = entry.file;
            option.textContent = entry.name || entry.file;
            selectEl.appendChild(option);
          });

          isDev && logger.debug('\n' + `playlistManager: loaded ${index.length} playlists from index`);
        })
        .catch(err => {
          logger.error('\n' + `playlistManager: failed to load playlist index: ${err}`);

          if (attempt < maxAttempts) {
            const delay = 1000 * attempt;
            isDev && logger.warn('\n' + `loadPlaylistIndex: fetch failed, retry ${attempt}/${maxAttempts} in ${delay}ms`);
            setTimeout(() => this.loadPlaylistIndex(attempt + 1, maxAttempts), delay);
          } else {
            logger.error('\n' + 'loadPlaylistIndex: all ' + maxAttempts + ' attempts failed - playlist index not loaded');
          }
        });
    }

    async handleLoadFromServer() {
      const { serverPlaylistSelect }  = this.elements;
      const selectedFile              = serverPlaylistSelect ? serverPlaylistSelect.value : '';

      if (!selectedFile) {
        isDev && logger.warn('\n' + 'playlistManager: no server playlist selected');
        return;
      }

      const url = `${PLAYLIST_BASE_URL}/${selectedFile}`;
      isDev && logger.info('\n'+ `playlistManager: loading server playlist from: ${url}`);

      await playlistManager.importFromUrlAsync(url);

      const loaded     = playlistManager.load() || [];
      const hasSeries  = loaded.some(entry => entry.series > 0);
      const hasEpisode = loaded.some(entry => entry.episode > 0);

      if (hasSeries || hasEpisode) {
        const sortSelect = document.getElementById('playlistSortSelect');
        if (sortSelect) {
          sortSelect.value = 'episode';
        }
        playlistManager.sortPlaylist('episode');
        isDev && logger.debug('\n' + 'playlistManager: series/episode entries detected - auto-sorted by episode');
      }

      if (!playlistManager._searchIndex && !playlistManager._loadSearchIndex()) {
        isDev && logger.debug('\n' + 'playlistManager: build search index from scratch');
        playlistManager.buildSearchIndex();
      }

      serverPlaylistSelect.value = '';

      const overlayExists = document.getElementById('emptyPlayerOverlay');
      if (!overlayExists) {
        isDev && logger.debug('\n' + `Restoring container and overlay for new video`);
        container.innerHTML = containerHTML;
      }

      // DOM id changed from 'skipad_playlist_parent' to 'videoplayer_playlist_parent'.
      const videoElement = document.getElementById('videoplayer_playlist_parent');
      if (videoElement) {
        scrollToElement(videoElement);
      }
    }
  } // END playlistIOHandler

  // ---------------------------------------------------------------------------
  // playlistSearchHandler (unchanged)
  // ---------------------------------------------------------------------------
  class playlistSearchHandler {
    constructor() {
      this.elements     = this.cacheElements();
      this._debounceTimer = null;
      this.init();
    }

    cacheElements() {
      return {
        searchInput:  document.getElementById('playlistSearchInput'),
        clearButton:  document.getElementById('playlistSearchClear'),
        resultCount:  document.getElementById('playlistSearchResultCount')
      };
    }

    init() {
      const { searchInput, clearButton } = this.elements;

      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          this._toggleClearButton(e.target.value);
          this._debounceSearch(e.target.value, 300);
        });

        searchInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            clearTimeout(this._debounceTimer);
            this._executeSearch(searchInput.value);
          }
          if (e.key === 'Escape') {
            e.preventDefault();
            this._clearSearch();
            searchInput.blur();
          }
        });
      }

      if (clearButton) {
        clearButton.addEventListener('click', () => {
          this._clearSearch();
          if (searchInput) searchInput.focus();
        });
      }

      isDev && logger.info('\n' + 'playlistManager: searchHandler initialized');
    }

    _debounceSearch(query, delayMs) {
      clearTimeout(this._debounceTimer);
      this._debounceTimer = setTimeout(() => {
        this._executeSearch(query);
      }, delayMs);
    }

    _toggleClearButton(value) {
      const { clearButton } = this.elements;
      if (clearButton) {
        clearButton.style.display = (value && value.trim()) ? 'inline-flex' : 'none';
      }
    }

    _executeSearch(query) {
      const { searchInput, clearButton, resultCount } = this.elements;
      const trimmed = (query || '').trim();

      if (!trimmed) {
        this._clearSearch();
        return;
      }

      const results = playlistManager.searchPlaylist(trimmed);

      if (resultCount) {
        resultCount.textContent = `${results.length} result${results.length !== 1 ? 's' : ''} found`;
        resultCount.style.display = 'inline';
      }

      if (clearButton) {
        clearButton.style.display = 'inline-flex';
      }
    }

    _clearSearch() {
      const { searchInput, clearButton, resultCount } = this.elements;

      if (searchInput) {
        searchInput.value = '';
      }

      if (clearButton) {
        clearButton.style.display = 'none';
      }

      if (resultCount) {
        resultCount.textContent = '';
        resultCount.style.display = 'none';
      }

      playlistManager.clearSearch();
    }

  } // END playlistSearchHandler

  // ---------------------------------------------------------------------------
  // playlistModeSwitchHandler (unchanged)
  // ---------------------------------------------------------------------------
  class playlistModeSwitchHandler {
    constructor() {
      this.elements = this.cacheElements();
      this.init();
    }

    cacheElements() {
      return {
        titleBar:       document.querySelector('.playlist-block-title'),
        listModeSwitch: null
      };
    }

    init() {
      const { titleBar } = this.elements;
      if (!titleBar) {
        isDev && logger.warn('\n' + 'playlistModeSwitchHandler: .playlist-block-title not found');
        return;
      }

      let listModeSwitch = document.getElementById('playlistModeSwitch');

      if (!listModeSwitch) {
        listModeSwitch            = document.createElement('div');
        listModeSwitch.id         = 'playlistModeSwitch';
        listModeSwitch.className  = 'switch not-spoken';
        listModeSwitch.innerHTML  = `
          <label>
            <input id="playlistMode" type="checkbox" name="playlistMode" checked>
            <span class="bmd-switch-track"></span>
            Cards
          </label>
        `;

        const sortSelect = document.getElementById('playlistSortSelect');
        if (sortSelect) {
          titleBar.insertBefore(listModeSwitch, sortSelect);
        } else {
          titleBar.appendChild(listModeSwitch);
        }

        isDev && logger.debug('\n'+ 'playlistModeSwitchHandler: created dynamic switch');
      } else {
        isDev && logger.debug('\n'+ 'playlistModeSwitchHandler: reusing existing static switch');
      }

      const checkbox = document.getElementById('playlistMode');
      if (!checkbox) {
        logger.error('\n' + 'playlistModeSwitchHandler: checkbox #playlistMode not found');
        return;
      }

      checkbox.checked = (playlistManager._displayMode === 'cards');

      checkbox.addEventListener('change', (e) => {
        if (e.target.checked) {
          playlistManager._displayMode = 'cards';
          localStorage.setItem('playlistMode', 'cards');
          isDev && logger.info('\n'+ 'playlistModeSwitchHandler: switched to card mode');
        } else {
          playlistManager._displayMode = 'list';
          localStorage.setItem('playlistMode', 'list');
          isDev && logger.info('\n'+ 'playlistModeSwitchHandler: switched to list mode');
        }
        playlistManager.renderCurrent();
      });

      this.elements.listModeSwitch = listModeSwitch;

      const data = playlistManager.load() || [];
      if (data.length === 0) {
        listModeSwitch.style.display = 'none';
      }

      isDev && logger.info('\n'+ 'playlistModeSwitchHandler: modeSwitchHandler initialized');
    }

  } // END playlistModeSwitchHandler

  // ---------------------------------------------------------------------------
  // playlistMergeSwitchHandler (unchanged)
  // ---------------------------------------------------------------------------
  class playlistMergeSwitchHandler {

    constructor(options) {
      // Constructor parameter renamed from _skipAdOptions to _videoPlayerOptions.
      this._videoPlayerOptions = options || null;
      this.elements            = this.cacheElements();
      this.init();
    }

    cacheElements() {
      return {
        titleBar:        document.querySelector('.playlist-block-title'),
        mergeModeSwitch: null
      };
    }

    init() {
      const opts = this._videoPlayerOptions;
      if (opts === null || !opts.enabled) {
        return;
      }

      const { titleBar } = this.elements;
      if (!titleBar) {
        isDev && logger.warn('\n' + 'playlistMergeSwitchHandler: .playlist-block-title not found');
        return;
      }

      let mergeModeSwitch = document.getElementById('playlistMergeSwitch');

      if (!mergeModeSwitch) {
        mergeModeSwitch           = document.createElement('div');
        mergeModeSwitch.id        = 'playlistMergeSwitch';
        mergeModeSwitch.className = 'switch not-spoken';
        mergeModeSwitch.innerHTML = `
          <label>
            <input id="mergeMode" type="checkbox" name="mergeMode">
            <span class="bmd-switch-track"></span>
            Merge
          </label>
        `;

        const listModeSwitch = document.getElementById('playlistModeSwitch');
        const sortSelect     = document.getElementById('playlistSortSelect');
        if (listModeSwitch && listModeSwitch.nextSibling) {
          titleBar.insertBefore(mergeModeSwitch, listModeSwitch.nextSibling);
        } else if (sortSelect) {
          titleBar.insertBefore(mergeModeSwitch, sortSelect);
        } else {
          titleBar.appendChild(mergeModeSwitch);
        }

        isDev && logger.debug('\n' + 'playlistMergeSwitchHandler: created dynamic switch');
      } else {
        isDev && logger.debug('\n' + 'playlistMergeSwitchHandler: reusing existing static switch');
      }

      const checkbox = document.getElementById('mergeMode');
      if (!checkbox) {
        logger.error('\n' + 'playlistMergeSwitchHandler: checkbox #mergeMode not found');
        return;
      }

      checkbox.checked = playlistManager._mergeMode;

      checkbox.addEventListener('change', (e) => {
        if (e.target.checked) {
          playlistManager._mergeMode = true;
          localStorage.setItem('mergeMode', 'true');
          isDev && logger.debug('\n' + 'playlistMergeSwitchHandler: merge mode enabled');
        } else {
          playlistManager._mergeMode = false;
          localStorage.setItem('mergeMode', 'false');
          isDev && logger.debug('\n' + 'playlistMergeSwitchHandler: merge mode disabled');
        }
        playlistManager.renderCurrent();
      });

      this.elements.mergeModeSwitch = mergeModeSwitch;

      const data = playlistManager.load() || [];
      if (data.length === 0) {
        mergeModeSwitch.style.display = 'none';
      }

      isDev && logger.info('\n'+ 'playlistManager: mergeSwitchHandler initialized');
    }

  } // END playlistMergeSwitchHandler

  // ---------------------------------------------------------------------------
  // playlistLoopSwitchHandler
  //
  // Options reference renamed from _skipAdOptions to _videoPlayerOptions.
  // ---------------------------------------------------------------------------
  class playlistLoopSwitchHandler {

    constructor(options) {
      this._videoPlayerOptions = options || null;
      this.elements            = this.cacheElements();
      this.init();
    }

    cacheElements() {
      return {
        titleBar:       document.querySelector('.playlist-block-title'),
        loopModeSwitch: null
      };
    }

    init() {
      const opts = this._videoPlayerOptions;

      if (opts === null || !opts.enabled) {
        return;
      }

      const { titleBar } = this.elements;
      if (!titleBar) {
        isDev && logger.warn('\n' + 'playlistLoopSwitchHandler: .playlist-block-title not found');
        return;
      }

      loopConfigEnabled = !!(opts.playlist && opts.playlist.loop && opts.playlist.loop.enabled);
      pipConfigEnabled  = !!(opts.playlist && opts.playlist.loop && opts.playlist.loop.pip);

      if (!loopConfigEnabled) {
        isDev && logger.debug('\n' + 'playlistLoopSwitchHandler: loop mode disabled by config, skipping init');
        return;
      }

      let loopModeSwitch = document.getElementById('playlisLoopSwitch');

      if (!loopModeSwitch) {
        loopModeSwitch            = document.createElement('div');
        loopModeSwitch.id         = 'playlisLoopSwitch';
        loopModeSwitch.className  = 'switch not-spoken';
        loopModeSwitch.innerHTML  = `
          <label>
            <input id="loopMode" type="checkbox" name="loopMode">
            <span class="bmd-switch-track"></span>
            Loop
          </label>
        `;

        const mergeModeSwitch = document.getElementById('playlistMergeSwitch');
        const sortSelect      = document.getElementById('playlistSortSelect');
        if (mergeModeSwitch && mergeModeSwitch.nextSibling) {
          titleBar.insertBefore(loopModeSwitch, mergeModeSwitch.nextSibling);
        } else if (sortSelect) {
          titleBar.insertBefore(loopModeSwitch, sortSelect);
        } else {
          titleBar.appendChild(loopModeSwitch);
        }

        isDev && logger.debug('\n' + 'playlistLoopSwitchHandler: created dynamic switch');
      } else {
        isDev && logger.debug('\n' + 'playlistLoopSwitchHandler: reusing existing static switch');
      }

      const checkbox = document.getElementById('loopMode');
      if (!checkbox) {
        logger.error('\n' + 'playlistLoopSwitchHandler: checkbox #loopMode not found');
        return;
      }

      checkbox.checked = playlistManager._loopEnabled;

      checkbox.addEventListener('change', (e) => {
        if (e.target.checked) {
          playlistManager._loopEnabled = true;
          localStorage.setItem('playlistLoop', 'true');
          isDev && logger.debug('\n' + 'playlistLoopSwitchHandler: loop mode enabled');
        } else {
          playlistManager._loopEnabled = false;
          localStorage.setItem('playlistLoop', 'false');
          isDev && logger.debug('\n' + 'playlistLoopSwitchHandler: loop mode disabled');
        }
      });

      this.elements.loopModeSwitch = loopModeSwitch;

      const data      = playlistManager.load() || [];
      const allSeries = data.length > 0 && data.every(e => e.series && e.series >= 1);
      if (!allSeries) {
        loopModeSwitch.style.display = 'none';
        if (playlistManager._loopEnabled) {
          playlistManager._loopEnabled = false;
          localStorage.setItem('playlistLoop', 'false');
        }
        checkbox.checked = false;
      }

      isDev && logger.info('\n'+ 'playlistManager: loopSwitchHandler initialized');
    }

  } // END playlistLoopSwitchHandler

  // ---------------------------------------------------------------------------
  // playlistSortHandler (unchanged)
  // ---------------------------------------------------------------------------
  class playlistSortHandler {
    constructor() {
      this.elements = this.cacheElements();
      this.init();
    }

    cacheElements() {
      return {
        titleBar:   document.querySelector('.playlist-block-title'),
        sortSelect: null
      };
    }

    init() {
      const { titleBar } = this.elements;
      if (!titleBar) {
        consoleLog('WARN', MODULE_NAME, 'playlistSortHandler: .playlist-block-title not found');
        return;
      }

      const canonicalOptions = [
        { value: 'watchDate',    label: 'Date (newest)' },
        { value: 'watchDateAsc', label: 'Date (oldest)' },
        { value: 'issueDate',    label: 'Issue Date (newest)' },
        { value: 'issueDateAsc', label: 'Issue Date (oldest)' },
        { value: 'duration',     label: 'Duration (longest)' },
        { value: 'durationAsc',  label: 'Duration (shortest)' },
        { value: 'title',        label: 'Title' },
        { value: 'author',       label: 'Author' },
        { value: 'category',     label: 'Category' },
        { value: 'description',  label: 'Description' },
        { value: 'rating',       label: 'Rating' },
        { value: 'episode',      label: 'Episode' },
        { value: 'type',         label: 'Type' }
      ];

      let select = document.getElementById('playlistSortSelect');

      if (select) {
        this._ensureOptions(select, canonicalOptions);
        isDev && logger.debug('\n' + 'playlistSortHandler: reusing existing static <select>');
      } else {
        select            = document.createElement('select');
        select.id         = 'playlistSortSelect';
        select.className  = 'playlist-sort-select';
        select.title      = 'Sort playlist';
        select.setAttribute('aria-label', 'Sort playlist');

        canonicalOptions.forEach(opt => {
          const o       = document.createElement('option');
          o.value       = opt.value;
          o.textContent = opt.label;
          select.appendChild(o);
        });

        titleBar.appendChild(select);
      }

      const storedSortMode = localStorage.getItem('searchMode');
      const sortCriterion  = storedSortMode || playlistManager._currentSort || 'watchDate';

      playlistManager._currentSort = sortCriterion;
      select.value = sortCriterion;

      isDev && logger.debug('\n' + `playlistSortHandler: sort criterion restored to "${sortCriterion}" (stored: ${storedSortMode || 'none'})`);

      const playlist = playlistManager.load() || [];
      if (playlist.length > 0) {
        playlistManager._applySortOrder(playlist);
        playlistManager.save(playlist);
        playlistManager.renderCurrent();
      }

      select.addEventListener('change', (e) => {
        localStorage.setItem('searchMode', e.target.value);
        playlistManager.sortPlaylist(e.target.value);
      });

      this.elements.sortSelect = select;

      const data = playlistManager.load() || [];
      if (data.length === 0) {
        select.style.display = 'none';
      }

      isDev && logger.debug('\n' + 'playlistManager: sortHandler initialized');
    }

    _ensureOptions(selectEl, canonical) {
      const existing = new Set(
        Array.from(selectEl.options).map(o => o.value)
      );

      canonical.forEach(opt => {
        if (!existing.has(opt.value)) {
          const o       = document.createElement('option');
          o.value       = opt.value;
          o.textContent = opt.label;
          selectEl.appendChild(o);

          isDev && logger.debug('\n'+ `playlistSortHandler: injected missing option "${opt.value}"`);
        }
      });
    }

  } // END playlistSortHandler

  // ---------------------------------------------------------------------------
  // inputValueBackgroundHandler (unchanged)
  // ---------------------------------------------------------------------------
  function inputValueBackgroundHandler() {

    const SELECTOR = [
      'input[type="text"]',
      'input[type="search"]',
      'input[type="date"]',
      'input[type="url"]',
      'input[type="email"]',
      'input[type="tel"]',
      'input[type="number"]',
      'input:not([type])',
      'select[form="playlist"]',
      'select[form="series"]',
      'select[form="type"]',
      'textarea'
    ].join(', ');

    const BG_FILLED  = getComputedStyle(document.documentElement)
                        .getPropertyValue('--input-background').trim() || '#E1F5FE';
    const BG_EMPTY   = getComputedStyle(document.documentElement)
                        .getPropertyValue('--card-background').trim()  || '#ffffff';
    const TEXT_COLOR  = getComputedStyle(document.documentElement)
                        .getPropertyValue('--text-color').trim()       || '#1d1d1f';

    function hasValue(el) {
      if (el instanceof HTMLSelectElement) {
        return el.selectedIndex > 0 || (el.value !== '' && el.value !== el.options[0]?.value);
      }
      return el.value.trim() !== '';
    }

    function syncBackground(el) {
      if (hasValue(el)) {
        el.style.setProperty('background-color', BG_FILLED, 'important');
        el.style.setProperty('color', TEXT_COLOR, 'important');
        el.dataset.valueFilled = 'true';
      } else {
        el.style.setProperty('background-color', BG_EMPTY, 'important');
        el.style.removeProperty('color');
        delete el.dataset.valueFilled;
      }
    }

    function syncAll() {
      document.querySelectorAll(SELECTOR).forEach(syncBackground);
    }

    document.addEventListener('input', (e) => {
      if (e.target.matches && e.target.matches(SELECTOR)) {
        syncBackground(e.target);
      }
    }, true);

    document.addEventListener('change', (e) => {
      if (e.target.matches && e.target.matches(SELECTOR)) {
        syncBackground(e.target);
      }
    }, true);

    setTimeout(syncAll, 250);
    setInterval(syncAll, 500);

    document.addEventListener('animationstart', (e) => {
      if (e.target.matches && e.target.matches(SELECTOR)) {
        setTimeout(() => syncBackground(e.target), 50);
      }
    }, true);

    isDev && logger.debug('\n' + 'inputValueBackgroundHandler: initialized');
  }

  // ---------------------------------------------------------------------------
  // navbarSmoothScrollHandler (unchanged)
  // ---------------------------------------------------------------------------
  function navbarSmoothScrollHandler() {
    const navMenu = document.getElementById('navigator_nav_menu');
    if (!navMenu) {
      isDev && logger.warn('\n' + 'navbarSmoothScrollHandler: navigator_nav_menu not found');
      return;
    }

    const anchors = navMenu.querySelectorAll('a.nav-link[href^="/#"]');
    if (!anchors.length) {
      isDev && logger.warn('\n' +  'navbarSmoothScrollHandler: no same-page anchor links found');
      return;
    }

    anchors.forEach((anchor) => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        const hash = href.replace(/^\/?/, '');

        e.preventDefault();
        e.stopPropagation();

        window.location.hash = hash;

        if (typeof j1 !== 'undefined' && typeof j1.scrollToAnchor === 'function') {
          j1.scrollToAnchor();
        } else {
          isDev && logger.warn('\n' +  'navbarSmoothScrollHandler: j1.scrollToAnchor not available');
        }
      });
    });

    isDev && logger.info('\n'+ 'navbarSmoothScrollHandler: registered ' + anchors.length + ' click handler(s)');
  }

  // ---------------------------------------------------------------------------
  // Public API (unchanged handler names for backward compatibility)
  // ---------------------------------------------------------------------------
  return {
    playlistManager:              playlistManager,
    playlistIOHandler:            playlistIOHandler,
    playlistSearchHandler:        playlistSearchHandler,
    playlistModeSwitchHandler:    playlistModeSwitchHandler,
    playlistMergeSwitchHandler:   playlistMergeSwitchHandler,
    playlistLoopSwitchHandler:    playlistLoopSwitchHandler,
    playlistSortHandler:          playlistSortHandler,
    inputWrapperHandler:          inputWrapperHandler,
    inputValueBackgroundHandler:  inputValueBackgroundHandler,
    navbarSmoothScrollHandler:    navbarSmoothScrollHandler
  };

}));