$(document).ready(function () {
    // 오류 1 : 스테이지 클리어후 총알이 안나옴
    // 단 3마리 죽이고 나서 스테이지 클리어하면 총알이 나옴


    //주인공에 대한 정보--------------- 
    var life = 3; //주인공 목숨
    var level = 0;
    var speed = 00; // 주인공 탱크의 움직이는 시간
    var dir = "t"; // 주인공 탱크의 방향
    var curpos = { //주인공 현재 위치
        x: 225, y: 400
    }
    //--------------------------------------------------------------------------------
    var score = 0; //누적 점수
    var kill = 0; //이번 스테이지에서 해치울 적들의 수
    //--------------------------------------------------------------------------------

    var bullet = "<img id='mybullet' src='images/bullet.png' alt='bullet' />";
    var ebullet = "<img class='ebullet' src='images/bullet.png' alt='bullet' />";
    var reload = 900; //재장전 시간
    var bspeed = 800; //포탄 날라가는 시간
    //----------------------------------------------------------------------------------

    var emax = 5; //최대 적군 수
    var maxbody = 6; //최대 적군의 시체 개수
    var fire = true;
    var hero = "<img id='hero' src='images/hero.png'>";
    var enemy = "<img class='enemy' src='images/enemy.png'>";
    var expl = "images/explode.gif";
    var firstpos;

    //포탄위치
    var bpos = { x: 0, y: 0 };



    var ebpos = [];
    function countlife() {
        $(".life:last-of-type").remove();
        if (life < 0) {
            alert("game over");
            location.reload();
        }
    }

    //게임 초기화-----------------------------------------------------------------------------------------------------------------------------
    function ini() {

        level++;
        $("#level").text("Stage : " + level);
        firstpos = {
            x: 225, y: 400
        }
        fire = true;
        $("mybullet").stop();
        $("#stage").empty(); //게임 다시하기(다 비우기)
        $("#stage").append(hero); //hero 배치
        $("#hero").css({
            left: firstpos.x + "px", top: firstpos.y + "px"
            //hero의 현재 위치
        });
        kill = emax;
        epos = []; //자리 위치 없애기
        en = -1; //두번째 스테이지도 en 0부터 시작하도록
        killorder = -1;

        // (죽여야 하는 적의 수)
    }


    //stage 탈출 추적기----------------------------------------------------------------------------------------------------------------------
    function bound(x, y) {
        if (x < 0) {
            return "xover-";
        } else if (x > 450) {
            return "xover+"
        } else if (y < 0) {
            return "yover-";
        } else if (y > 450) {
            return "yover+";
        } else {
            return "ok";
        }
    }


    //주인공의 위치 추적------------------------------------------------------
    function where() {
        //왼쪽 상단 고정
        curpos.x = parseInt($("#hero").css("left"));
        curpos.y = parseInt($("#hero").css("top"));
        //나가면 안으로 들여보내기
        if (bound(curpos.x, curpos.y) == "xover-") {
            $("#hero").stop().animate({ left: "50px" }, 100);
        } else if (bound(curpos.x, curpos.y) == "xover+") {
            $("#hero").stop().animate({ left: "400px" }, 100);
        } else if (bound(curpos.x, curpos.y) == "yover-") {
            $("#hero").stop().animate({ top: "50px" }, 100);
        } else if (bound(curpos.x, curpos.y) == "yover+") {
            $("#hero").stop().animate({ top: "400px" }, 100);
        }
    }
    //------------------------------------------------------------------------------------------------------------------------------------
    var killorder = -1; //적군 죽는 순서
    //주인공 포탄 위치추적기
    function bposfind() {
        bpos.x = parseInt($("#mybullet").css("left"));
        bpos.y = parseInt($("#mybullet").css("top"));

        //주인공 포탄과 적군들의 피격 판정
        for (i = 0; i < epos.length; i++) {
            if (
                (bpos.x > epos[i][0] && bpos.x < epos[i][0] + 30)
                &&
                (bpos.y > epos[i][1] && bpos.y < epos[i][1] + 30)
            ) {
                if (!$(".e" + i).hasClass("dead")) {
                    //dead라는 클래스를 가지고 있지않으면 (즉 처음 죽었다면)
                    kill--;
                    score += 10;
                    $("#score").text("score : " + score);
                    if ($(".dead").length >= maxbody) {
                        //.dead의 data의 최솟값 가져오기
                        var champ = 0;

                        for (j = 0; j < $(".dead").length - 1; j++) {



                            if (parseInt($(".dead").eq(champ).attr("data")) > parseInt($(".dead").eq(j + 1).attr("data"))) {
                                champ = j + 1;
                            }
                        }
                        //오류 0만 삭제가 됨
                        $(".dead").eq(champ).fadeOut(function () {
                            //$(".dead").eq(champ) 2가
                            // alert($(this));
                            var n = $(this).index(".enemy");
                            //dead 에너미중에서 몇번째니
                            epos[n] = [600, 600];
                            $(this).attr("data", 10000);
                        });

                    }
                    killorder++; //처음 죽었을때만
                }
                //math.min 잘사용하면 될거같기도한데

                $(".e" + i).stop().attr("src", expl).addClass("dead").attr("data", killorder);
                //폭탄맞음
                clearTimeout(no[i]);
                //폭탄을 맞은 애들한테만 settimeout을 없애줌
                //죽은애들의 위치를 없애줌
                $("#mybullet").remove(); //포탄 삭제
                bpos.x = null;
                bpos.y = null;
                //위치 초기화


                //다 죽였다면-----------------------------------------------------------------------------------------------------------------
                if (kill <= 0) {
                    setTimeout(function () {
                        var conf = confirm("Stage Clear");
                        if (conf) {
                            //ini하는 시점이 너무 빨라서 confirm으로 바꾼후 1초 지연
                            emax += 3;
                            //추가
                            fire = true;
                            ini();//초기화
                        }
                    }, 1000);
                }
            }
        }
    }
    //주인공 피격 판정
    function herohit() {
        for (i = 0; i < ebpos.length; i++) {
            if (//피격되면
                (curpos.x < ebpos[i][0] && curpos.x + 30 > ebpos[i][0])
                &&
                (curpos.y < ebpos[i][1] && curpos.y + 30 > ebpos[i][1])
            ) {
                if (!$("#hero").hasClass("respon")) {
                    $("#hero").attr("src", expl).addClass("temp").removeAttr("id");
                    setTimeout(function () {
                        $(".temp").fadeOut(function () {
                            $(this).remove();
                            curpos.x = 600;
                            curpos.y = 600;

                            //hero가 무적이 아니라면
                            life--;
                            countlife();

                            // hero다시 생성
                            $("#stage").append(hero);
                            $("#hero").css({
                                left: firstpos.x + "px",
                                top: firstpos.y + "px"
                            }).addClass("respon");//1초동안 무적
                            setTimeout(function () {
                                $("#hero").removeClass("respon");
                            }, 2000);
                        });
                    }, 1000)
                }
            }
        }
    }


    //적군 위치 추적기---------------------------------------------------------------------------------------------------------------------
    var epos = [];
    var ereload = [];
    //포탄 장전
    function ewhere(who, edir) {
        //누가 어디서 방향은?
        var i = who.replace(".e", "");
        epos[i] = [];
        epos[i][0] = parseInt($(who).css("left"));
        // ex) epos[2][0] //2번째의 0
        epos[i][1] = parseInt($(who).css("top"));
        if (bound(epos[i][0], epos[i][1]) == "xover-") {
            $(who).stop().animate({ left: "50px" }, 100);
        } else if (bound(epos[i][0], epos[i][1]) == "xover+") {
            $(who).stop().animate({ left: "400px" }, 100);
        } else if (bound(epos[i][0], epos[i][1]) == "yover-") {
            $(who).stop().animate({ top: "50px" }, 100);
        } else if (bound(epos[i][0], epos[i][1]) == "yover+") {
            $(who).stop().animate({ top: "400px" }, 100);
        }



        //포탄 발사--------------------------------------------------------------------------------------------------------------------
        if (ereload[i]) {
            //한번만 발사
            ereload[i] = false;
            setTimeout(function () {
                ereload[i] = true;
            }, reload + 2000);
            $("#stage").append(ebullet);
            $(".ebullet:last-of-type").addClass("eb" + i);
            //한명이 여러개를 못쏘니까 이름으로 클래스 넣어주기

            $(".eb" + i).css({
                left: epos[i][0] + 25 - 10 + "px",
                top: epos[i][1] + 25 - 10 + "px",
                transform: "rotate(" + (edir * 90 - 90) + "deg)"
            });
            // edir이 0이면 왼쪽, 1이면 위쪽, 2면 오른쪽, 3이면 아래쪽이다.
            if (edir % 2 == 0) {
                //좌, 우로 움직인다면
                var pm;
                if (edir == 0) { pm = "-="; } else { pm = "+="; }
                //나머지가 0이면
                $(".eb" + i).animate({ left: pm + "500px" }, {
                    duration: bspeed + 500,
                    easing: "linear",
                    step: function () {
                        //적군 포탄 위치 추적
                        ebpos[i] = [];
                        ebpos[i][0] = parseInt($(".eb" + i).css("left"));
                        //포탄의 x축 위치
                        ebpos[i][1] = parseInt($(".eb" + i).css("top"));
                        herohit();
                    },
                    complete: function () {
                        $(".eb" + i).remove();
                    }
                });
            } else {
                //상, 하로 움직인다면
                var pm;
                if (edir == 1) { pm = "-="; } else { pm = "+="; }
                $(".eb" + i).animate({ top: pm + "500px" }, {
                    duration: bspeed + 500,
                    easing: "linear",
                    step: function () {
                        //적군 포탄 위치 추적
                        ebpos[i] = [];
                        ebpos[i][0] = parseInt($(".eb" + i).css("left"));
                        //포탄의 x축 위치
                        ebpos[i][1] = parseInt($(".eb" + i).css("top"));
                        //포탄위 y축 위치
                        herohit();
                    },
                    complete: function () {
                        $(".eb" + i).remove();
                    }
                });
            }
        }
    }


    // 랜덤한 정수 생성기--------------------------------------------------------------------------------------------------------------
    //             2    6
    function rand(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
        //랜덤값 min~max
    }


    // ←(37)/↑(38)/→(39)/↓(40)/spacebar(32)---------------------------------------------------------------------------------
    var key = "";
    $(document).keydown(function (e) {
        key = e.keyCode;
        //누르고 있으면 이동
    });
    $(document).keyup(function () {
        key = "";
    });

    $(document).keydown(function () {
        switch (key) {
            case 37: //왼쪽 키
                $("#hero").css("transform", "rotate(-90deg)");
                dir = "l"; //left
                $("#hero").stop().animate({
                    left: "-=10px"
                    //한번 이동할때마다 10px 이동
                }, {
                    duration: speed,
                    easing: "linear", //일정속도로 이동
                    step: function () {
                        where();
                        //지금 내가 어디있는지 수시로 보는것
                    }
                });
                break;
            case 38:
                $("#hero").css("transform", "rotate(0deg)");
                dir = "t";
                $("#hero").stop().animate({ //stop을 임의로 없앴음
                    top: "-=10px"
                }, {
                    duration: speed,
                    easing: "linear",
                    step: function () {
                        where();
                    }
                });
                break;
            case 39:
                $("#hero").css("transform", "rotate(90deg)");
                dir = "r";
                $("#hero").stop().animate({
                    left: "+=10px"
                }, {
                    duration: speed,
                    easing: "linear",
                    step: function () {
                        where();
                    }
                });
                break;
            case 40:
                $("#hero").css("transform", "rotate(180deg)");
                dir = "b";
                $("#hero").stop().animate({
                    top: "+=10px"
                }, {
                    duration: speed,
                    easing: "linear",
                    step: function () {
                        where();
                    }
                });
                break;
            //주인공 포탄 발사--------------------------------------------------------------------------------------------------
            case 32:
                if (fire) {

                    var bulletdeg = 0;
                    switch (dir) {
                        case "l": bulletdeg = -90; break;
                        case "t": bulletdeg = 0; break;
                        case "r": bulletdeg = 90; break;
                        case "b": bulletdeg = 180; break;
                    }
                    $("#stage").append(bullet);
                    $("#mybullet").css({
                        // bullet이미지의 아이디가 mybullet임
                        left: curpos.x + 25 - 10 + "px",
                        //포탄 크기가 20이라서 가운데 정렬하기 위해
                        top: curpos.y + 25 - 10 + "px",
                        transform: "rotate(" + bulletdeg + "deg)"
                    });
                    switch (dir) {
                        case "l":
                            $("#mybullet").animate({
                                left: "-=500px"
                                //스테이지 나가도 상관 없음
                            }, {
                                duration: bspeed,
                                easing: "linear",
                                step: function () {
                                    fire = false;
                                    bposfind();
                                    //주인공 포탄 위치 추적
                                },
                                complete: function () {
                                    $("#mybullet").remove();
                                }
                            });
                            setTimeout(function () { fire = true; }, reload);
                            break;
                        case "t":
                            $("#mybullet").animate({
                                top: "-=500px"
                            }, {
                                duration: bspeed,
                                easing: "linear",
                                step: function () {
                                    fire = false;
                                    bposfind();
                                },
                                complete: function () {
                                    //사정거리까지 날라가면
                                    $("#mybullet").remove();
                                }
                            });
                            setTimeout(function () { fire = true; }, reload);
                            break;
                        case "r":
                            $("#mybullet").animate({
                                left: "+=500px"
                            }, {
                                duration: bspeed,
                                easing: "linear",
                                step: function () {
                                    fire = false;
                                    bposfind();
                                },
                                complete: function () {
                                    $("#mybullet").remove();
                                }
                            });
                            setTimeout(function () { fire = true; }, reload);
                            break;
                        case "b":
                            $("#mybullet").animate({
                                top: "+=500px"
                            }, {
                                duration: bspeed,
                                easing: "linear",
                                step: function () {
                                    fire = false;
                                    bposfind();
                                },
                                complete: function () {
                                    $("#mybullet").remove();
                                }
                            });
                            setTimeout(function () { fire = true; }, reload);
                            break;
                    }
                }
                break;
        }
    });
    ini();


    // 적군 생성기-------------------------------------------------------------------------------------------------------------------------------
    var en = -1;//enemy의 number 적군 번호
    function addenemy() {
        if ($(".enemy").length < emax) {
            en++; //0부터 시작
            var ex = rand(0, 450); //맵 안에 들어가야하니까
            var ey = rand(0, 450);
            $("#stage").append(enemy);
            $(".enemy:last-of-type").addClass("e" + en);//방금 만든 적에 클래스 추가
            $(".e" + en).css({
                left: ex + "px",
                top: ey + "px"
            });
            enemymove(".e" + en);//if문 안에
            ereload[en] = true;
        }

    }
    setInterval(addenemy, rand(500, 3000));

    //적군 랜덤 움직임---------------------------------------------
    function enemymove(who) {
        var edir = rand(0, 3); //방향 0이면 왼쪽, 1이면 위쪽, 2이면 오른쪽, 3이면 아래쪽
        //방향이 만들어진 후 움직이기 전에 포탄 발사
        var emove = 180; //거리
        //거리와 시간을 동일하게 0.06px/ms
        switch (edir) {
            case 0://왼쪽
                $(who).css("transform", "rotate(-90deg)").stop().animate({ left: "-=" + emove + "px" }, {
                    duration: 3000,
                    easing: "linear",
                    step: function () {
                        ewhere(who, edir);
                        // ewhere에게 who와 edir을 보내야함
                    }
                });
                break;
            case 1://위쪽
                $(who).css("transform", "rotate(0deg)").stop().animate({ top: "-=" + emove + "px" }, {
                    duration: 3000,
                    easing: "linear",
                    step: function () {
                        ewhere(who, edir);
                    }
                });
                break;
            case 2:
                $(who).css("transform", "rotate(90deg)").stop().animate({ left: "+=" + emove + "px" }, {
                    duration: 3000,
                    easing: "linear",
                    step: function () {
                        ewhere(who, edir);
                    }
                });
                break;
            case 3:
                $(who).css("transform", "rotate(180deg)").stop().animate({ top: "+=" + emove + "px" }, {
                    duration: 3000,
                    easing: "linear",
                    step: function () {
                        ewhere(who, edir);
                    }
                });
                break;
        }
        var n = who.replace(".e", "");
        no[n] = setTimeout(enemymove, rand(500, 3000), who);//가는 도중에 방향 전환
        //enemymove가 실행되기 전에 쏴야함, 그리고 방향이 만들어진 다음에
    }
    var no = [];



});















