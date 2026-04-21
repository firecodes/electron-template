document.addEventListener('DOMContentLoaded', function() {
    console.log('Harmony PC 开发者社区页面加载完成');

    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
        });
    });
});
