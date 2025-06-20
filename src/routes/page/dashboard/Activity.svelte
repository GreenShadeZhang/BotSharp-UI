<script>
	import Link from 'svelte-link';
	import { Card, CardBody, CardTitle, Col } from '@sveltestrap/sveltestrap';
    import { _ } from 'svelte-i18n';
    import { fly } from 'svelte/transition';
    import { onMount } from 'svelte';
    
    let mounted = false;
    
    onMount(() => {
        mounted = true;
    });
    
    const activities = [
        {
            date: '22 Nov',
            text: 'Responded to need "Volunteer Activities"',
            isActive: false,
            icon: 'bx-message-dots'
        },
        {
            date: '17 Nov', 
            text: 'Everyone realizes why a new common language would be desirable...',
            hasReadMore: true,
            isActive: false,
            icon: 'bx-book-open'
        },
        {
            date: '15 Nov',
            text: 'Joined the group "Boardsmanship Forum"',
            isActive: true,
            icon: 'bx-group'
        },
        {
            date: '12 Nov',
            text: 'Responded to need "In-Kind Opportunity"',
            isActive: false,
            icon: 'bx-heart'
        }
    ];
</script>

<Col xl={4}>
    {#if mounted}
        <div in:fly={{ y: 30, duration: 800, delay: 400 }}>
            <Card class="modern-activity-card">
                <CardBody>
                    <CardTitle class="modern-card-title">
                        {$_('Activity')}
                    </CardTitle>

                    <div class="activity-timeline">
                        {#each activities as activity, index}
                            <div class="activity-item {activity.isActive ? 'active' : ''}" in:fly={{ x: -20, duration: 500, delay: 600 + index * 100 }}>
                                <div class="activity-icon">
                                    <i class="bx {activity.icon}"></i>
                                </div>
                                <div class="activity-content">
                                    <div class="activity-date">
                                        {activity.date}
                                        <i class="bx bx-right-arrow-alt"></i>
                                    </div>
                                    <div class="activity-text">
                                        {activity.text}
                                        {#if activity.hasReadMore}
                                            <Link class="read-more-link">{$_('Read more')}</Link>
                                        {/if}
                                    </div>
                                </div>
                            </div>
                        {/each}
                    </div>
                    
                    <div class="text-center mt-4">
                        <Link class="modern-btn-primary">
                            {$_('View More')} <i class="mdi mdi-arrow-right ms-1"></i>
                        </Link>
                    </div>
                </CardBody>
            </Card>
        </div>
    {/if}
</Col>

<style>
.modern-activity-card {
    border: none;
    border-radius: 20px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(20px);
    background: rgba(255, 255, 255, 0.9);
    transition: all 0.3s ease;
}

.modern-activity-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.modern-card-title {
    font-size: 20px;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 25px;
}

.activity-timeline {
    position: relative;
    padding-left: 10px;
}

.activity-timeline::before {
    content: '';
    position: absolute;
    left: 24px;
    top: 20px;
    bottom: 20px;
    width: 2px;
    background: linear-gradient(to bottom, rgba(102, 126, 234, 0.3), rgba(118, 75, 162, 0.3));
    border-radius: 2px;
}

.activity-item {
    position: relative;
    display: flex;
    align-items: flex-start;
    margin-bottom: 25px;
    transition: all 0.3s ease;
}

.activity-item:last-child {
    margin-bottom: 0;
}

.activity-item:hover {
    transform: translateX(5px);
}

.activity-icon {
    position: relative;
    z-index: 2;
    width: 48px;
    height: 48px;
    background: linear-gradient(45deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
    border: 2px solid rgba(102, 126, 234, 0.2);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 15px;
    flex-shrink: 0;
    transition: all 0.3s ease;
}

.activity-item.active .activity-icon {
    background: linear-gradient(45deg, #667eea, #764ba2);
    border-color: #667eea;
    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
}

.activity-icon i {
    font-size: 20px;
    color: #667eea;
    transition: all 0.3s ease;
}

.activity-item.active .activity-icon i {
    color: white;
}

.activity-content {
    flex: 1;
    padding-top: 5px;
}

.activity-date {
    font-size: 14px;
    font-weight: 600;
    color: #667eea;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
}

.activity-date i {
    font-size: 12px;
    opacity: 0.7;
}

.activity-text {
    color: #6c757d;
    font-size: 14px;
    line-height: 1.5;
}

.activity-item.active .activity-text {
    color: #2c3e50;
    font-weight: 500;
}

.read-more-link {
    color: #667eea;
    font-weight: 500;
    text-decoration: none;
    font-size: 13px;
    margin-left: 5px;
    transition: all 0.3s ease;
}

.read-more-link:hover {
    color: #764ba2;
    text-decoration: none;
}

.modern-btn-primary {
    background: linear-gradient(45deg, #667eea, #764ba2);
    border: none;
    border-radius: 25px;
    padding: 10px 20px;
    color: white;
    text-decoration: none;
    font-weight: 600;
    font-size: 14px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s ease;
    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
}

.modern-btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
    color: white;
    text-decoration: none;
}

@media (max-width: 768px) {
    .activity-icon {
        width: 40px;
        height: 40px;
        margin-right: 12px;
    }
    
    .activity-icon i {
        font-size: 18px;
    }
    
    .activity-date {
        font-size: 13px;
    }
    
    .activity-text {
        font-size: 13px;
    }
}
</style>
