<script lang="ts">
    import onTrackCorpFav from "$lib/assets/onTrackCorpFav.png";
</script>

<header>
    <h1 class="sideTitle"><img class="sideTitleIcon" src={onTrackCorpFav} alt="o" />nTrack</h1>
    <nav class="navbar navbar-expand-lg bg-body-tertiary">
        <div class="container-fluid">
            <button
                class="navbar-toggler"
                type="button"
                data-bs-target="#navbarNav"
                aria-controls="navbarNav"
                aria-expanded="false"
                aria-label="Toggle navigation"
            >
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav">
                    <li class="nav-item">
                        <a
                            class="nav-link active"
                            aria-current="page"
                            aria-disabled="true">Home</a
                        >
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href=".\projects">Projects</a>
                    </li>
                </ul>
            </div>
        </div>
    </nav>
    <div class="split">
        <div class="divSide"></div>
        <div class="divMain"></div>
    </div>
</header>
