import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Course } from "../../types/types";
import useEntityApi from "../../utils/useEntityApi";
import getMyUserId from "../../utils/userIdProvider";
import { categories, Category } from "../../types/categories";
import { User } from "../signUp/SignUp";

// MUI
import { Box, Typography, Fab, IconButton, Tooltip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { ErrorOutline } from "@mui/icons-material";

const CourseWrapper: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const { listAsync, updateAsync } = useEntityApi("courses");
  const { listAsync: listUsersAsync } = useEntityApi("users");

  const [courses, setCourses] = useState<Course[]>([]);
  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const userId: string | null = getMyUserId();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const courseResponse = await listAsync();
        const allCourses: Course[] = courseResponse.data;

        let filteredCourses: Course[] = [];
        let myEnrolledCourses: Course[] = [];

        if (userId) {
          myEnrolledCourses = allCourses.filter(
            (c) =>
              c.enrolledUserIds.includes(userId) && c.creatorUserId !== userId
          );
          filteredCourses = allCourses.filter(
            (c) =>
              c.categoryId === categoryId &&
              c.creatorUserId !== userId &&
              !c.enrolledUserIds.includes(userId)
          );
        } else {
          filteredCourses = allCourses.filter(
            (c) => c.categoryId === categoryId
          );
        }

        setCourses(filteredCourses);
        setMyCourses(myEnrolledCourses);

        const usersResponse = await listUsersAsync();
        setUsers(usersResponse.data);
      } catch (error) {
        console.error("Veri çekme hatası:", error);
      }
    };

    fetchData();
  }, [categoryId, listAsync, listUsersAsync]);

  const getCategoryName = (catId: string): string =>
    categories.find((cat: Category) => cat.id === catId)?.name || catId;

  const getCreatorName = (creatorId: string): string =>
    users.find((user: User) => user.id === creatorId)?.name || creatorId;

  const checkConflict = (courseA: Course, courseB: Course): boolean => {
    if (courseA.time.days !== courseB.time.days) return false;

    const aStart = parseInt(courseA.time.start.replace(":", ""));
    const aEnd = parseInt(courseA.time.end.replace(":", ""));
    const bStart = parseInt(courseB.time.start.replace(":", ""));
    const bEnd = parseInt(courseB.time.end.replace(":", ""));

    return aStart < bEnd && bStart < aEnd;
  };

  const handleEnroll = async (course: Course) => {
    if (!userId) {
      console.error("Kullanıcı kimliği bulunamadı.");
      return;
    }

    const isConflict = myCourses.some((c) => checkConflict(c, course));

    if (isConflict) {
      alert(
        "Bu kurs, mevcutta kayıtlı olduğunuz başka bir kursla zaman çakışması yaşıyor."
      );
      return;
    }

    if (!course.enrolledUserIds.includes(userId)) {
      const updatedEnrolled = [...course.enrolledUserIds, userId];
      const updatedCourse = { ...course, enrolledUserIds: updatedEnrolled };

      try {
        await updateAsync(course.id, updatedCourse);

        // 1️⃣ Kursu ekranda güncelle
        setCourses((prevCourses) =>
          prevCourses.map((c) => (c.id === course.id ? updatedCourse : c))
        );

        // 2️⃣ Yeni kursu myCourses listesine de ekle
        setMyCourses((prev) => [...prev, updatedCourse]);
      } catch (error) {
        console.error("Enroll işlemi başarısız:", error);
      }
    }
  };

  return (
    <Box sx={{ position: "relative", p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Kategori:{" "}
        {categories.find((cat: Category) => cat.id === categoryId)?.name ||
          "Bilinmiyor"}
      </Typography>

      {courses.length === 0 ? (
        <Box textAlign="center" mt={4}>
          <Typography variant="h6" fontWeight={500} color="text.secondary">
            Bu kategoriye ait veya gösterilebilecek kurs bulunamadı.
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            justifyContent: "center",
          }}
        >
          {courses.map((course) => {
            const categoryName = getCategoryName(course.categoryId);
            const creatorName = getCreatorName(course.creatorUserId);
            const isConflicting = userId
              ? myCourses.some((c) => checkConflict(c, course))
              : false;

            return (
              <Box
                key={course.id}
                sx={{
                  position: "relative",
                  flex: "0 0 calc(33.33% - 16px)",
                  maxWidth: "calc(33.33% - 16px)",
                  bgcolor: "white",
                  borderRadius: 2,
                  boxShadow: 3,
                  p: 2,
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                  minWidth: "250px",
                }}
              >
                {isConflicting && (
                  <Tooltip title="Bu kurs zaman olarak başka bir kursla çakışıyor.">
                    <ErrorOutline
                      color="error"
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        fontSize: 24,
                      }}
                    />
                  </Tooltip>
                )}

                <Typography variant="h6" fontWeight={600}>
                  {course.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Instructor: {course.instructor}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Time: {course.time.days} – {course.time.start} →{" "}
                  {course.time.end}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Category: {categoryName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Creator: {creatorName}
                </Typography>

                {userId && (
                  <IconButton
                    onClick={() => handleEnroll(course)}
                    disabled={isConflicting}
                    disableRipple
                    disableFocusRipple
                    disableTouchRipple
                    sx={{
                      position: "absolute",
                      bottom: 8,
                      right: 8,
                      width: 40,
                      height: 40,
                      bgcolor: isConflicting ? "#a5d6a7" : "green", // arka plan
                      color: "white", // artı ikonu
                      pointerEvents: isConflicting ? "none" : "auto", // tıklanamaz
                      opacity: 1, // default soluk görünümü engelle
                      cursor: isConflicting ? "not-allowed" : "pointer",
                      "&.Mui-disabled": {
                        bgcolor: "#a5d6a7",
                        color: "white",
                      },
                      "&:hover": {
                        bgcolor: isConflicting ? "#a5d6a7" : "darkgreen",
                      },
                    }}
                  >
                    <AddIcon />
                  </IconButton>
                )}
              </Box>
            );
          })}

          {userId && (
            <Fab
              color="primary"
              sx={{ position: "fixed", bottom: 16, right: 16 }}
              onClick={() => {}}
            >
              <AddIcon />
            </Fab>
          )}
        </Box>
      )}
    </Box>
  );
};

export default CourseWrapper;
