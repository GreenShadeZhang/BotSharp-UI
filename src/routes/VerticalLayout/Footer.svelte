<script>
	import { Col, Container, Row } from '@sveltestrap/sveltestrap';
    import { PUBLIC_COMPANY_NAME } from '$env/static/public'
    import { _ } from 'svelte-i18n'  

</script>

<footer class="md-footer">
    <Container fluid>
        <Row>
            <Col sm={6}>
                <div class="md-typescale-body-medium md-color-on-surface-variant">
                    {new Date().getFullYear()} © {PUBLIC_COMPANY_NAME}
                </div>
            </Col>
            <Col sm={6}>
                <div class="text-sm-end d-none d-sm-block md-typescale-body-medium md-color-on-surface-variant">
                    {$_('Design & Developed by open source community')}
                </div>
            </Col>
        </Row>
    </Container>
</footer>