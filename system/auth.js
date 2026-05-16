const DISCORD_CONFIG = {
  clientId: '1503165405370388500',
  redirectUri: window.location.origin + '/system/callback.html',
  scope: 'identify guilds guilds.members.read',
  guildId: '1450556186251231426',
  gmRoleId: '1503164535744368660',
  memberRoleId: '1450560884777947320'
};

class DiscordAuth {
  constructor() {
    this.user = null;
    this.accessToken = null;
    this.isGM = false;
    this.isMember = false;
    this.canCreateCharacter = false;
  }

  getAuthUrl() {
    const params = new URLSearchParams({
      client_id: DISCORD_CONFIG.clientId,
      redirect_uri: DISCORD_CONFIG.redirectUri,
      response_type: 'token',
      scope: DISCORD_CONFIG.scope
    });
    return `https://discord.com/api/oauth2/authorize?${params}`;
  }

  async getUserInfo(accessToken) {
    try {
      const response = await fetch('https://discord.com/api/users/@me', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user info');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching user info:', error);
      throw error;
    }
  }

  async getGuildMember(accessToken, userId) {
    try {
      const response = await fetch(
        `https://discord.com/api/users/@me/guilds/${DISCORD_CONFIG.guildId}/member`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch guild member info');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching guild member:', error);
      return null;
    }
  }

  async checkGMRole(accessToken) {
    try {
      const member = await this.getGuildMember(accessToken, this.user.id);
      
      if (!member) {
        return false;
      }
      
      return member.roles.includes(DISCORD_CONFIG.gmRoleId);
    } catch (error) {
      console.error('Error checking GM role:', error);
      return false;
    }
  }

  async checkMemberRole(accessToken) {
    try {
      const member = await this.getGuildMember(accessToken, this.user.id);
      
      if (!member) {
        return false;
      }
      
      return member.roles.includes(DISCORD_CONFIG.memberRoleId);
    } catch (error) {
      console.error('Error checking Member role:', error);
      return false;
    }
  }

  async login(accessToken) {
    try {
      this.accessToken = accessToken;
      
      const userInfo = await this.getUserInfo(accessToken);
      this.user = userInfo;
      
      this.isGM = await this.checkGMRole(accessToken);
      this.isMember = await this.checkMemberRole(accessToken);
      
      this.canCreateCharacter = this.isGM || this.isMember;
      
      this.saveSession();
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }

  logout() {
    this.user = null;
    this.accessToken = null;
    this.isGM = false;
    this.isMember = false;
    this.canCreateCharacter = false;
    
    localStorage.removeItem('discord_token');
    localStorage.removeItem('discord_user');
    localStorage.removeItem('discord_is_gm');
    localStorage.removeItem('discord_is_member');
    localStorage.removeItem('discord_can_create');
    localStorage.removeItem('discord_token_expiry');
  }

  saveSession() {
    localStorage.setItem('discord_token', this.accessToken);
    localStorage.setItem('discord_user', JSON.stringify(this.user));
    localStorage.setItem('discord_is_gm', this.isGM.toString());
    localStorage.setItem('discord_is_member', this.isMember.toString());
    localStorage.setItem('discord_can_create', this.canCreateCharacter.toString());
    
    const expiryTime = Date.now() + (7 * 24 * 60 * 60 * 1000);
    localStorage.setItem('discord_token_expiry', expiryTime.toString());
  }

  async restoreSession() {
    try {
      const token = localStorage.getItem('discord_token');
      const userStr = localStorage.getItem('discord_user');
      const isGMStr = localStorage.getItem('discord_is_gm');
      const isMemberStr = localStorage.getItem('discord_is_member');
      const canCreateStr = localStorage.getItem('discord_can_create');
      const expiryStr = localStorage.getItem('discord_token_expiry');
      
      if (!token || !userStr || !expiryStr) {
        return false;
      }
      
      const expiry = parseInt(expiryStr);
      if (Date.now() > expiry) {
        this.logout();
        return false;
      }
      
      this.accessToken = token;
      this.user = JSON.parse(userStr);
      this.isGM = isGMStr === 'true';
      this.isMember = isMemberStr === 'true';
      this.canCreateCharacter = canCreateStr === 'true';
      
      const userInfo = await this.getUserInfo(token);
      if (!userInfo) {
        this.logout();
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error restoring session:', error);
      this.logout();
      return false;
    }
  }

  isAuthenticated() {
    return this.user !== null && this.accessToken !== null;
  }
}

window.discordAuth = new DiscordAuth();
