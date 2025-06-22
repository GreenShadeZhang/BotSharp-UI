<script>
	import { Col, Container, Row } from '@sveltestrap/sveltestrap';
    import { PUBLIC_COMPANY_NAME, PUBLIC_COMPANY_WEBSITE } from '$env/static/public'
    import { _ } from 'svelte-i18n'  

</script>

<footer class="footer">
    <Container fluid>        
        <Row>
            <Col sm={6}>
                {new Date().getFullYear()} © <a href={PUBLIC_COMPANY_WEBSITE} target="_blank" rel="noopener noreferrer" class="company-link">{PUBLIC_COMPANY_NAME}</a>
            </Col>
            <Col sm={6}>
                <div class="text-sm-end d-none d-sm-block">
                    {$_('Design & Developed by open source community')}
                </div>
            </Col>
        </Row>
    </Container>
</footer>

<style>
    .company-link {
        color: inherit;
        text-decoration: none;
        position: relative;
        z-index: 10;
        pointer-events: auto;
    }
    
    .company-link:hover {
        color: var(--bs-primary);
        text-decoration: underline;
    }
    
    .company-link:focus {
        outline: 2px solid var(--bs-primary);
        outline-offset: 2px;
    }
</style>