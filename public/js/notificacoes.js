// notificacoes.js
class NotificacaoService {
    constructor() {
        this.permissao = false;
        this.inicializar();
    }

    async inicializar() {
        this.permissao = await this.solicitarPermissao();
        this.registrarServiceWorker();
    }

    async solicitarPermissao() {
        if (!('Notification' in window)) {
            console.log('Este navegador não suporta notificações desktop');
            return false;
        }

        if (Notification.permission === 'granted') {
            return true;
        }

        if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        }

        return false;
    }

    async registrarServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('ServiceWorker registrado');
            } catch (error) {
                console.error('Erro ao registrar ServiceWorker:', error);
            }
        }
    }

    enviarNotificacao(titulo, opcoes = {}) {
        if (!this.permissao) {
            console.log('Permissão para notificações não concedida');
            return;
        }

        const opcoesDefault = {
            icon: '/icon.png',
            badge: '/badge.png',
            vibrate: [200, 100, 200],
            tag: 'conectaserv-notification',
            ...opcoes
        };

        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(registration => {
                registration.showNotification(titulo, opcoesDefault);
            });
        } else {
            new Notification(titulo, opcoesDefault);
        }
    }

    notificarNovaMensagem(remetente, mensagem) {
        this.enviarNotificacao('Nova Mensagem', {
            body: `${remetente}: ${mensagem}`,
            tag: 'nova-mensagem',
            data: {
                tipo: 'mensagem',
                remetente: remetente
            }
        });
    }

    notificarNovaSolicitacao(cliente, servico) {
        this.enviarNotificacao('Nova Solicitação de Serviço', {
            body: `${cliente} solicitou: ${servico}`,
            tag: 'nova-solicitacao',
            data: {
                tipo: 'solicitacao',
                cliente: cliente
            }
        });
    }

    notificarStatusServico(status, servico) {
        this.enviarNotificacao('Atualização de Serviço', {
            body: `Serviço "${servico}" foi ${status}`,
            tag: 'status-servico',
            data: {
                tipo: 'status',
                servico: servico
            }
        });
    }

    limparNotificacoes() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(registration => {
                registration.getNotifications().then(notifications => {
                    notifications.forEach(notification => notification.close());
                });
            });
        }
    }
}

export default NotificacaoService;